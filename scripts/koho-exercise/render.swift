// 関節位置の JSON から、立体の人物を SceneKit で描いて動画（mp4）や確認用の画像にする
// 使い方：
//   render moves.json sheet out.jpg 4 name:0.25 name:0.5 ...（確認用の一覧）
//   render moves.json video outdir [name ...]（動画と代表の1コマ）
//   render moves.json thumb out.jpg name:0.75（カード用の絵）
import AVFoundation
import AppKit
import Metal
import SceneKit

struct MoveData: Decodable {
	let name: String
	let dur: Double
	let yaw: Double
	let pitch: Double
	let key: Double
	let frames: [[String: [Double]]]
}

let args = CommandLine.arguments
let moves = try! JSONDecoder().decode([MoveData].self, from: Data(contentsOf: URL(fileURLWithPath: args[1])))
let S: CGFloat = 0.01 // 1px = 1cm

func vec(_ a: [Double]) -> SCNVector3 { SCNVector3(CGFloat(a[0]) * S, CGFloat(a[1]) * S, CGFloat(a[2]) * S) }
func sub(_ a: SCNVector3, _ b: SCNVector3) -> SCNVector3 { SCNVector3(a.x - b.x, a.y - b.y, a.z - b.z) }
func add(_ a: SCNVector3, _ b: SCNVector3) -> SCNVector3 { SCNVector3(a.x + b.x, a.y + b.y, a.z + b.z) }
func mul(_ a: SCNVector3, _ k: CGFloat) -> SCNVector3 { SCNVector3(a.x * k, a.y * k, a.z * k) }
func length(_ a: SCNVector3) -> CGFloat { (a.x * a.x + a.y * a.y + a.z * a.z).squareRoot() }
func normal(_ a: SCNVector3) -> SCNVector3 { let l = length(a); return l < 1e-6 ? SCNVector3(0, 1, 0) : mul(a, 1 / l) }

func color(_ hex: Int) -> NSColor {
	NSColor(srgbRed: CGFloat((hex >> 16) & 255) / 255, green: CGFloat((hex >> 8) & 255) / 255, blue: CGFloat(hex & 255) / 255, alpha: 1)
}
func material(_ hex: Int, rough: CGFloat) -> SCNMaterial {
	let m = SCNMaterial()
	m.lightingModel = .physicallyBased
	m.diffuse.contents = color(hex)
	m.roughness.contents = rough
	m.metalness.contents = 0.0
	return m
}
let cloth = material(0xEFE9DD, rough: 0.92)
let clothShade = material(0xDDD6C8, rough: 0.92)
let skin = material(0xDDAE86, rough: 0.55)
let shoe = material(0x26221F, rough: 0.75)
let hairM = material(0x35312D, rough: 0.7)
let beardM = material(0xCFCAC1, rough: 0.85)
let sashM = material(0x2A6058, rough: 0.7)
let buttonM = material(0x2F4F49, rough: 0.6)

let scene = SCNScene()
scene.background.contents = color(0xF2EEE9)
let root = SCNNode()
scene.rootNode.addChildNode(root)

// y 軸を a → b に向ける
func align(_ node: SCNNode, _ a: SCNVector3, _ b: SCNVector3) {
	let d = sub(b, a)
	let l = max(length(d), 1e-4)
	let n = normal(d)
	node.position = mul(add(a, b), 0.5)
	// (0,1,0) を n に回す四元数
	let w = 1 + n.y
	if w < 1e-5 {
		node.orientation = SCNQuaternion(1, 0, 0, 0)
	} else {
		let q = SCNVector4(n.z, 0, -n.x, w)
		let ql = (q.x * q.x + q.z * q.z + q.w * q.w).squareRoot()
		node.orientation = SCNQuaternion(q.x / ql, 0, q.z / ql, q.w / ql)
	}
	node.scale = SCNVector3(1, l, 1)
}

// 太さが変わる手足
func limb(_ r1: CGFloat, _ r2: CGFloat, _ m: SCNMaterial, parent: SCNNode = root) -> SCNNode {
	let c = SCNCone(topRadius: r2 * S, bottomRadius: r1 * S, height: 1)
	c.radialSegmentCount = 48
	c.firstMaterial = m
	let n = SCNNode(geometry: c)
	parent.addChildNode(n)
	return n
}
func ball(_ r: CGFloat, _ m: SCNMaterial, parent: SCNNode = root) -> SCNNode {
	let s = SCNSphere(radius: r * S)
	s.segmentCount = 64
	s.firstMaterial = m
	let n = SCNNode(geometry: s)
	parent.addChildNode(n)
	return n
}

/* 脚 */
struct Leg {
	let thigh = limb(12.5, 10.5, cloth)
	let shin = limb(10.5, 6.5, cloth)
	let hipBall = ball(12.5, cloth)
	let knee = ball(10.5, cloth)
	let cuff = ball(6.8, clothShade)
	let foot = ball(1, shoe)
}
/* 腕 */
struct Arm {
	let upper = limb(7.8, 6.6, cloth)
	let fore = limb(6.6, 7, cloth)
	let shoulder = ball(8.4, cloth)
	let elbow = ball(6.6, cloth)
	let cuff = ball(7, clothShade)
	let hand = ball(1, skin)
}
let legL = Leg()
let legR = Leg()
let armL = Arm()
let armR = Arm()
let pelvis = ball(1, cloth)

/* 上半身（ひとかたまりで動かす。座標は「腰の中心を原点」にした cm） */
let upperRoot = SCNNode()
root.addChildNode(upperRoot)
func local(_ x: CGFloat, _ y: CGFloat, _ z: CGFloat) -> SCNVector3 { SCNVector3(x * S, (y - 98) * S, z * S) }

// 胴は1本の円すい台にして、肩を楕円で丸める（ふくらみの段差を作らない）
let torsoGeo = SCNCone(topRadius: 24.5 * S, bottomRadius: 19 * S, height: 56 * S)
torsoGeo.radialSegmentCount = 64
torsoGeo.firstMaterial = cloth
let torso = SCNNode(geometry: torsoGeo)
torso.position = local(0, 134, 0)
torso.scale = SCNVector3(1, 1, 0.62)
upperRoot.addChildNode(torso)
let chest = ball(1, cloth, parent: upperRoot)
chest.position = local(0, 162, 0)
chest.scale = SCNVector3(24.5, 9, 15.2)
let skirtGeo = SCNCone(topRadius: 18.5 * S, bottomRadius: 25 * S, height: 36 * S)
skirtGeo.radialSegmentCount = 64
skirtGeo.firstMaterial = cloth
let skirt = SCNNode(geometry: skirtGeo)
skirt.position = local(0, 90, 0)
skirt.scale = SCNVector3(1, 1, 0.72)
upperRoot.addChildNode(skirt)
// 帯
let sashGeo = SCNTorus(ringRadius: 18.5 * S, pipeRadius: 3.6 * S)
sashGeo.ringSegmentCount = 72
sashGeo.firstMaterial = sashM
let sash = SCNNode(geometry: sashGeo)
sash.position = local(0, 108, 0)
sash.scale = SCNVector3(1, 1, 0.74)
upperRoot.addChildNode(sash)
let tailGeo = SCNBox(width: 8 * S, height: 30 * S, length: 1.6 * S, chamferRadius: 0.7 * S)
tailGeo.firstMaterial = sashM
let tail = SCNNode(geometry: tailGeo)
tail.position = local(11, 91, 15.5)
tail.eulerAngles = SCNVector3(0.08, 0, 0.05)
upperRoot.addChildNode(tail)
// 合わせ目と飾りボタン
func seam(_ a: SCNVector3, _ b: SCNVector3) {
	let n = limb(0.55, 0.55, buttonM, parent: upperRoot)
	align(n, a, b)
}
seam(local(0, 168, 8), local(0, 160, 15))
seam(local(0, 160, 15), local(0, 110, 12))
seam(local(0, 104, 13.8), local(0, 73, 18.2))
for (y, z) in [(154.0, 14.8), (142.0, 14.2), (130.0, 13.5), (118.0, 12.8)] as [(CGFloat, CGFloat)] {
	let geo = SCNCapsule(capRadius: 1.1 * S, height: 7 * S)
	geo.firstMaterial = buttonM
	let b = SCNNode(geometry: geo)
	b.position = local(0, y, z)
	b.eulerAngles = SCNVector3(0, 0, CGFloat.pi / 2)
	upperRoot.addChildNode(b)
}
// 立ち襟
let collarGeo = SCNCylinder(radius: 7.4 * S, height: 6 * S)
collarGeo.firstMaterial = clothShade
let collar = SCNNode(geometry: collarGeo)
collar.position = local(0, 169, 0)
upperRoot.addChildNode(collar)
// 首と頭（顔は描かない）
let neck = limb(6, 5.6, skin, parent: upperRoot)
align(neck, local(0, 166, 0), local(0, 180, 1))
let headY: CGFloat = 190
let head = ball(1, skin, parent: upperRoot)
head.position = local(0, headY, 1)
head.scale = SCNVector3(11.3, 13.4, 12.2)
let hair = ball(1, hairM, parent: upperRoot)
hair.position = local(0, headY + 2.6, -2.4)
hair.scale = SCNVector3(11.9, 13, 11.8)
let bun = ball(5.6, hairM, parent: upperRoot)
bun.position = local(0, headY + 15.5, -3)
let beard = limb(7.2, 1.2, beardM, parent: upperRoot)
align(beard, local(0, headY - 8, 8), local(0, headY - 34, 11))
let beardRoot = ball(1, beardM, parent: upperRoot)
beardRoot.position = local(0, headY - 8, 7.5)
beardRoot.scale = SCNVector3(7.6, 5.5, 5.2)

/* 床 */
let mat = SCNCylinder(radius: 1.05, height: 0.004)
mat.radialSegmentCount = 96
let matM = SCNMaterial()
matM.lightingModel = .constant
matM.diffuse.contents = color(0xE6DFD4)
mat.firstMaterial = matM
let matNode = SCNNode(geometry: mat)
matNode.position = SCNVector3(0, -0.004, 0)
scene.rootNode.addChildNode(matNode)
let floorGeo = SCNFloor()
floorGeo.reflectivity = 0
let floorM = SCNMaterial()
floorM.lightingModel = .shadowOnly
floorGeo.firstMaterial = floorM
scene.rootNode.addChildNode(SCNNode(geometry: floorGeo))

/* 光 */
let key = SCNLight()
key.type = .directional
key.intensity = 760
key.castsShadow = true
key.shadowMapSize = CGSize(width: 4096, height: 4096)
key.shadowSampleCount = 16
key.shadowRadius = 5
key.shadowColor = NSColor(white: 0, alpha: 0.42)
key.orthographicScale = 3.2
key.zNear = 0.1
key.zFar = 20
let keyNode = SCNNode()
keyNode.light = key
keyNode.position = SCNVector3(-2.4, 5, 4)
keyNode.look(at: SCNVector3(0, 1, 0))
scene.rootNode.addChildNode(keyNode)
let fill = SCNLight()
fill.type = .directional
fill.intensity = 190
let fillNode = SCNNode()
fillNode.light = fill
fillNode.position = SCNVector3(4, 1.5, 3)
fillNode.look(at: SCNVector3(0, 1, 0))
scene.rootNode.addChildNode(fillNode)
let rim = SCNLight()
rim.type = .directional
rim.intensity = 170
let rimNode = SCNNode()
rimNode.light = rim
rimNode.position = SCNVector3(1, 3, -4)
rimNode.look(at: SCNVector3(0, 1, 0))
scene.rootNode.addChildNode(rimNode)
let amb = SCNLight()
amb.type = .ambient
amb.intensity = 300
let ambNode = SCNNode()
ambNode.light = amb
scene.rootNode.addChildNode(ambNode)

/* カメラ */
let cam = SCNCamera()
cam.fieldOfView = 28
cam.zNear = 0.1
cam.zFar = 40
cam.wantsHDR = true
cam.wantsExposureAdaptation = false
cam.screenSpaceAmbientOcclusionIntensity = 1.4
cam.screenSpaceAmbientOcclusionRadius = 0.12
let camNode = SCNNode()
camNode.camera = cam
scene.rootNode.addChildNode(camNode)

let renderer = SCNRenderer(device: MTLCreateSystemDefaultDevice(), options: nil)
renderer.scene = scene
renderer.pointOfView = camNode
renderer.autoenablesDefaultLighting = false

func setView(_ m: MoveData) {
	root.eulerAngles = SCNVector3(0, CGFloat(m.yaw * .pi / 180), 0)
	let p = CGFloat(max(m.pitch, 9) * .pi / 180)
	let d: CGFloat = 6.1
	let ty: CGFloat = 1.1
	camNode.position = SCNVector3(0, ty + d * sin(p), d * cos(p))
	camNode.look(at: SCNVector3(0, ty, 0))
}

func pose(_ f: [String: [Double]]) {
	func P(_ k: String) -> SCNVector3 { vec(f[k]!) }
	func leg(_ l: Leg, _ hip: SCNVector3, _ knee: SCNVector3, _ foot: SCNVector3, _ toe: SCNVector3) {
		let lift = SCNVector3(0, 0.035, 0)
		let ankle = add(foot, SCNVector3(0, 0.05, 0))
		align(l.thigh, hip, knee)
		align(l.shin, knee, ankle)
		l.hipBall.position = hip
		l.knee.position = knee
		l.cuff.position = ankle
		align(l.foot, add(foot, lift), add(toe, lift))
		let footLen = max(length(sub(toe, foot)), 0.01)
		let o = l.foot.orientation
		l.foot.scale = SCNVector3(5.8, footLen * 0.72 / S, 4.2)
		l.foot.orientation = o
		l.foot.position = add(add(foot, lift), mul(sub(toe, foot), 0.42))
	}
	func arm(_ a: Arm, _ s: SCNVector3, _ e: SCNVector3, _ h: SCNVector3) {
		align(a.upper, s, e)
		align(a.fore, e, h)
		a.shoulder.position = s
		a.elbow.position = e
		a.cuff.position = h
		let dir = normal(sub(h, e))
		align(a.hand, h, add(h, mul(dir, 0.15)))
		a.hand.scale = SCNVector3(4.8, 9, 3)
		a.hand.position = add(h, mul(dir, 0.075))
	}
	leg(legL, P("hipL"), P("kneeL"), P("footL"), P("toeL"))
	leg(legR, P("hipR"), P("kneeR"), P("footR"), P("toeR"))
	arm(armL, P("shoulderL"), P("elbowL"), P("handL"))
	arm(armR, P("shoulderR"), P("elbowR"), P("handR"))
	let hc = mul(add(P("hipL"), P("hipR")), 0.5)
	pelvis.position = hc
	pelvis.scale = SCNVector3(21, 14, 13)
	let r = f["right"]!, u = f["up"]!, w = f["fwd"]!, o = P("origin")
	upperRoot.transform = SCNMatrix4(
		m11: CGFloat(r[0]), m12: CGFloat(r[1]), m13: CGFloat(r[2]), m14: 0,
		m21: CGFloat(u[0]), m22: CGFloat(u[1]), m23: CGFloat(u[2]), m24: 0,
		m31: CGFloat(w[0]), m32: CGFloat(w[1]), m33: CGFloat(w[2]), m34: 0,
		m41: o.x, m42: o.y, m43: o.z, m44: 1)
}

func shot(_ m: MoveData, _ i: Int, size: CGFloat) -> CGImage {
	SCNTransaction.begin()
	SCNTransaction.animationDuration = 0
	setView(m)
	pose(m.frames[i])
	SCNTransaction.commit()
	SCNTransaction.flush()
	let img = renderer.snapshot(atTime: 0, with: CGSize(width: size, height: size), antialiasingMode: .multisampling4X)
	return img.cgImage(forProposedRect: nil, context: nil, hints: nil)!
}

func writeJPEG(_ img: CGImage, _ path: String, _ q: Double = 0.82) {
	let rep = NSBitmapImageRep(cgImage: img)
	try! rep.representation(using: .jpeg, properties: [.compressionFactor: q])!.write(to: URL(fileURLWithPath: path))
}

if args[2] == "thumb" {
	// カード用の 16:9 の絵（args: out.jpg name:位置）
	let p = args[4].split(separator: ":")
	let m = moves.first { $0.name == String(p[0]) }!
	let i = Int(Double(p[1])! * Double(m.frames.count)) % m.frames.count
	SCNTransaction.begin()
	SCNTransaction.animationDuration = 0
	setView(m)
	pose(m.frames[i])
	SCNTransaction.commit()
	SCNTransaction.flush()
	let img = renderer.snapshot(atTime: 0, with: CGSize(width: 1280, height: 720), antialiasingMode: .multisampling4X)
	writeJPEG(img.cgImage(forProposedRect: nil, context: nil, hints: nil)!, args[3], 0.86)
	print("thumb ok")
} else if args[2] == "sheet" {
	let out = args[3]
	let cols = Int(args[4])!
	let items = Array(args[5...])
	let cell = 400
	let rows = (items.count + cols - 1) / cols
	let ctx = CGContext(data: nil, width: cols * cell, height: rows * cell, bitsPerComponent: 8, bytesPerRow: 0, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
	for (idx, it) in items.enumerated() {
		let p = it.split(separator: ":")
		let m = moves.first { $0.name == String(p[0]) }!
		let i = Int(Double(p[1])! * Double(m.frames.count)) % m.frames.count
		let img = shot(m, i, size: CGFloat(cell))
		ctx.draw(img, in: CGRect(x: idx % cols * cell, y: (rows - 1 - idx / cols) * cell, width: cell, height: cell))
	}
	writeJPEG(ctx.makeImage()!, out)
	print("sheet ok")
} else {
	let outdir = args[3]
	let names = args.count > 4 ? Array(args[4...]) : moves.map { $0.name }
	let px = 540
	for name in names {
		let m = moves.first { $0.name == name }!
		let url = URL(fileURLWithPath: "\(outdir)/\(name).mp4")
		try? FileManager.default.removeItem(at: url)
		let writer = try! AVAssetWriter(outputURL: url, fileType: .mp4)
		let settings: [String: Any] = [
			AVVideoCodecKey: AVVideoCodecType.h264,
			AVVideoWidthKey: px,
			AVVideoHeightKey: px,
			AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: 500_000, AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel, AVVideoMaxKeyFrameIntervalKey: 60],
		]
		let input = AVAssetWriterInput(mediaType: .video, outputSettings: settings)
		input.expectsMediaDataInRealTime = false
		let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
			kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
			kCVPixelBufferWidthKey as String: px,
			kCVPixelBufferHeightKey as String: px,
		])
		writer.add(input)
		writer.startWriting()
		writer.startSession(atSourceTime: .zero)
		let n = m.frames.count
		let images = (0..<n).map { shot(m, $0, size: CGFloat(px)) }
		// 短い動画はくり返しのつなぎ目で引っかかりやすいので、5秒以上になるまで同じ周期を重ねる
		let reps = max(1, Int((5.0 / m.dur).rounded(.up)))
		let step = m.dur / Double(n)
		var count = 0
		for _ in 0..<reps {
			for img in images {
				while !input.isReadyForMoreMediaData { Thread.sleep(forTimeInterval: 0.005) }
				var pb: CVPixelBuffer?
				CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &pb)
				CVPixelBufferLockBaseAddress(pb!, [])
				let ctx = CGContext(data: CVPixelBufferGetBaseAddress(pb!), width: px, height: px, bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(pb!), space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue)!
				ctx.draw(img, in: CGRect(x: 0, y: 0, width: px, height: px))
				CVPixelBufferUnlockBaseAddress(pb!, [])
				adaptor.append(pb!, withPresentationTime: CMTime(seconds: Double(count) * step, preferredTimescale: 60000))
				count += 1
			}
		}
		input.markAsFinished()
		let done = DispatchSemaphore(value: 0)
		writer.finishWriting { done.signal() }
		done.wait()
		// 動きを減らす設定のときに見せる代表の1コマ
		let keyIdx = Int((m.key / 24 * Double(n)).rounded()) % n
		writeJPEG(images[keyIdx], "\(outdir)/\(name).jpg", 0.78)
		let size = (try! FileManager.default.attributesOfItem(atPath: url.path)[.size] as! Int) / 1024
		print(name, "\(size)KB", "frames", count, "status", writer.status.rawValue, writer.error?.localizedDescription ?? "")
	}
}
