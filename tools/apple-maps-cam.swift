// Apple Maps camera helper for tools/apple-maps-capture.sh (reference capture, see docs/apple-maps-capture.md).
// Build: swiftc -O tools/apple-maps-cam.swift -o /tmp/apple-maps-cam
//   win                       -> "<windowID> <x> <y> <w> <h> <pid>" of the Maps map window (points)
//   state                     -> "<heading deg> <view angle 0..1 | 2D>" read from accessibility
//   rotate <heading>          -> Option+drag left/right until the compass reads the heading
//   tilt <0..1>               -> Option+drag up/down until the View Angle slider reads the value
//   drag <x1> <y1> <x2> <y2> <mods> -> mouse drag in window points (none = pan, opt = rotate/tilt)
//   press <control> [n]       -> press a control by accessibility description ("Zoom In", "3D mode", ...)
//   angle <0..1>              -> set the View Angle slider directly (works, but shifts the view centre: prefer tilt)
//   key <keycode> <mods> <n> [ms] / hold <keycode> <mods> <ms> -> key events posted to the Maps pid only
//   ocr <png> <x> <y> <w> <h> -> text in a pixel rectangle (scale bar);  resize <x> <y> <w> <h> -> move/size the window
import AppKit
import ApplicationServices
import Vision

func mapsWindow() -> (id: Int, x: Int, y: Int, w: Int, h: Int, pid: pid_t)? {
  let l = CGWindowListCopyWindowInfo([.optionOnScreenOnly], kCGNullWindowID) as! [[String: Any]]
  for w in l where (w["kCGWindowOwnerName"] as? String) == "Maps" && (w["kCGWindowLayer"] as? Int) == 0 {
    let b = w["kCGWindowBounds"] as! [String: Any]
    let n = { (k: String) in Int((b[k] as! NSNumber).doubleValue) }
    if n("Width") < 400 { continue }  // skip popovers
    return (w["kCGWindowNumber"] as! Int, n("X"), n("Y"), n("Width"), n("Height"), pid_t(w["kCGWindowOwnerPID"] as! Int))
  }
  return nil
}

func flags(_ s: String) -> CGEventFlags {
  var f = CGEventFlags()
  for m in s.split(separator: ",") {
    switch m {
    case "opt": f.insert(.maskAlternate)
    case "cmd": f.insert(.maskCommand)
    case "shift": f.insert(.maskShift)
    case "ctrl": f.insert(.maskControl)
    default: break
    }
  }
  return f
}

let a = CommandLine.arguments
guard a.count > 1, let w = mapsWindow() else { FileHandle.standardError.write("no Maps window or no command\n".data(using: .utf8)!); exit(1) }
let src = CGEventSource(stateID: .hidSystemState)
func post(_ code: CGKeyCode, _ down: Bool, _ f: CGEventFlags, repeatKey: Bool = false) {
  let e = CGEvent(keyboardEventSource: src, virtualKey: code, keyDown: down)!
  e.flags = f
  if repeatKey { e.setIntegerValueField(.keyboardEventAutorepeat, value: 1) }
  e.postToPid(w.pid)
}
// Accessibility: the right-hand control column exposes everything needed.
//   AXButton "3D mode"/"2D view", "Zoom In", "Zoom Out"; AXSlider "View Angle" (value 0..1, only in 3D);
//   AXButton "Compass" with value "Heading: 328 degrees Northwest".
let ax = AXUIElementCreateApplication(w.pid)
func attr(_ e: AXUIElement, _ k: String) -> AnyObject? { var v: AnyObject?; AXUIElementCopyAttributeValue(e, k as CFString, &v); return v }
func find(_ e: AXUIElement, _ desc: String) -> AXUIElement? {
  if (attr(e, "AXDescription") as? String) == desc { return e }
  for c in (attr(e, "AXChildren") as? [AXUIElement] ?? []) { if let r = find(c, desc) { return r } }
  return nil
}
func control(_ desc: String) -> AXUIElement? {
  guard let win = (attr(ax, "AXWindows") as? [AXUIElement])?.first else { return nil }
  return find(win, desc)
}
func angle() -> Double? { control("View Angle").flatMap { attr($0, "AXValue") as? NSNumber }?.doubleValue }
func heading() -> Int? {
  guard let v = control("Compass").flatMap({ attr($0, "AXValue") as? String }) else { return nil }
  return v.split(separator: " ").compactMap { Int($0) }.first
}
// Mouse events are only honoured at the HID tap (postToPid is ignored by Maps), so they move the real cursor
// and land on whatever is under it: refuse unless Maps is the frontmost app, and put the cursor back afterwards.
func drag(_ x1: Double, _ y1: Double, _ x2: Double, _ y2: Double, _ f: CGEventFlags) {
  if NSWorkspace.shared.frontmostApplication?.processIdentifier != w.pid {
    FileHandle.standardError.write("Maps is not frontmost: refusing to post mouse events\n".data(using: .utf8)!); exit(3)
  }
  let p1 = CGPoint(x: Double(w.x) + x1, y: Double(w.y) + y1), p2 = CGPoint(x: Double(w.x) + x2, y: Double(w.y) + y2)
  let back = CGEvent(source: nil)!.location
  func mouse(_ t: CGEventType, _ p: CGPoint) {
    let e = CGEvent(mouseEventSource: src, mouseType: t, mouseCursorPosition: p, mouseButton: .left)!
    e.flags = f
    e.post(tap: .cghidEventTap)
    usleep(16_000)
  }
  mouse(.mouseMoved, p1); usleep(100_000); mouse(.leftMouseDown, p1); usleep(100_000)
  for i in 1...30 {
    let t = Double(i) / 30
    mouse(.leftMouseDragged, CGPoint(x: p1.x + (p2.x - p1.x) * t, y: p1.y + (p2.y - p1.y) * t))
  }
  usleep(300_000)  // rest before release so the map does not coast
  mouse(.leftMouseUp, p2)
  usleep(100_000); CGWarpMouseCursorPosition(back)
}
switch a[1] {
case "state":  // heading in degrees (0 = north up), view angle 0..1 or "2D"
  guard let h = heading() else { FileHandle.standardError.write("Maps window not reachable (not on this Space?)\n".data(using: .utf8)!); exit(1) }
  print(h, angle().map { String(format: "%.3f", $0) } ?? "2D")
case "press":  // press <AXDescription> [n]
  let n = a.count > 3 ? Int(a[3])! : 1
  for _ in 0..<n {
    guard let b = control(a[2]) else { FileHandle.standardError.write("no control \(a[2])\n".data(using: .utf8)!); exit(1) }
    AXUIElementPerformAction(b, "AXPress" as CFString); usleep(700_000)
  }
case "angle":  // angle <0..1>: set the View Angle slider (enters 3D first if needed)
  if control("View Angle") == nil, let b = control("3D mode") { AXUIElementPerformAction(b, "AXPress" as CFString); sleep(2) }
  guard let s = control("View Angle") else { FileHandle.standardError.write("no View Angle slider\n".data(using: .utf8)!); exit(1) }
  let target = Double(a[2])!
  AXUIElementSetAttributeValue(s, "AXValue" as CFString, NSNumber(value: target))
  usleep(800_000)
  // fallback: step with AXIncrement/AXDecrement if the direct set was ignored
  var guardN = 0
  while let v = angle(), abs(v - target) > 0.03, guardN < 60 {
    AXUIElementPerformAction(s, (v < target ? "AXIncrement" : "AXDecrement") as CFString); usleep(250_000); guardN += 1
  }
  print(angle() ?? -1)
case "drag":  // drag <x1> <y1> <x2> <y2> <mods>: left-drag in window points (plain = pan, opt = rotate)
  drag(Double(a[2])!, Double(a[3])!, Double(a[4])!, Double(a[5])!, flags(a[6]))
case "rotate":  // rotate <heading>: Option+drag horizontally until the compass reads the heading (0.25 deg per point)
  let target = Double(a[2])!
  var tries = 0
  while tries < 12 {
    guard let h = heading() else { exit(1) }
    let err = (target - Double(h) + 540).truncatingRemainder(dividingBy: 360) - 180
    if abs(err) < 1 { break }
    // short drags lose about 10 points to the gesture threshold
    let dx = max(-360, min(360, -err * 4 - (abs(err) < 6 ? (err < 0 ? -10.0 : 10.0) : 0))), cx = Double(w.w) / 2, y = Double(w.h) * 0.55
    drag(cx - dx / 2, y, cx + dx / 2, y, .maskAlternate)
    usleep(700_000); tries += 1
  }
  print(heading() ?? -1)
case "tilt":  // tilt <0..1>: Option+drag vertically until the View Angle slider reads the value (1 = lowest camera)
  // Measured from the reset 2D view: slider = (points dragged up - 51) * 0.0108, clamped at 1.0 (about 150 points).
  let target = Double(a[2])!, cx = Double(w.w) / 2, ys = Double(w.h) * 0.6
  if target >= 0.999 {
    drag(cx, ys + 130, cx, ys - 130, .maskAlternate); usleep(900_000)
  } else {
    var tries = 0
    while tries < 8 {
      let v = angle()
      let err = target - (v ?? 0)
      if abs(err) < 0.04 { break }
      var d = err / 0.0108
      d += v == nil ? 51 : (d > 0 ? 10 : -10)
      d = max(-200, min(200, d))
      drag(cx, ys + d / 2, cx, ys - d / 2, .maskAlternate)
      usleep(900_000); tries += 1
    }
  }
  print(angle().map { String(format: "%.3f", $0) } ?? "2D")
case "ocr":  // ocr <png> <x> <y> <w> <h>: text in a pixel rectangle (used to read the scale bar)
  let img = NSImage(contentsOfFile: a[2])!.cgImage(forProposedRect: nil, context: nil, hints: nil)!
  let crop = img.cropping(to: CGRect(x: Int(a[3])!, y: Int(a[4])!, width: Int(a[5])!, height: Int(a[6])!))!
  let req = VNRecognizeTextRequest()
  req.recognitionLevel = .accurate
  try? VNImageRequestHandler(cgImage: crop).perform([req])
  print((req.results ?? []).compactMap { $0.topCandidates(1).first?.string }.joined(separator: " "))
case "resize":  // resize <x> <y> <w> <h> in points
  guard let win = (attr(ax, "AXWindows") as? [AXUIElement])?.first else { exit(1) }
  var p = CGPoint(x: Double(a[2])!, y: Double(a[3])!), s = CGSize(width: Double(a[4])!, height: Double(a[5])!)
  AXUIElementSetAttributeValue(win, "AXPosition" as CFString, AXValueCreate(.cgPoint, &p)!)
  AXUIElementSetAttributeValue(win, "AXSize" as CFString, AXValueCreate(.cgSize, &s)!)
case "win":
  print(w.id, w.x, w.y, w.w, w.h, w.pid)
case "key":
  let code = CGKeyCode(a[2])!, f = flags(a[3]), n = Int(a[4])!, ms = a.count > 5 ? Int(a[5])! : 120
  for _ in 0..<n {
    post(code, true, f); usleep(30_000); post(code, false, f); usleep(useconds_t(ms * 1000))
  }
case "hold":
  let code = CGKeyCode(a[2])!, f = flags(a[3]), ms = Int(a[4])!
  post(code, true, f)
  var t = 0
  while t < ms { usleep(33_000); t += 33; post(code, true, f, repeatKey: true) }
  post(code, false, f)
default:
  exit(2)
}
