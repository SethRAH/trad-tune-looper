var e = Object.defineProperty,
  t = Object.getOwnPropertyDescriptor,
  n = Object.getOwnPropertyNames,
  r = Object.prototype.hasOwnProperty,
  i = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), (e = null)), t.exports),
  a = (t, n) => {
    let r = {};
    for (var i in t) e(r, i, { get: t[i], enumerable: !0 });
    return (n || e(r, Symbol.toStringTag, { value: `Module` }), r);
  },
  o = (i, a, o, s) => {
    if ((a && typeof a == `object`) || typeof a == `function`)
      for (var c = n(a), l = 0, u = c.length, d; l < u; l++)
        ((d = c[l]),
          !r.call(i, d) &&
            d !== o &&
            e(i, d, {
              get: ((e) => a[e]).bind(null, d),
              enumerable: !(s = t(a, d)) || s.enumerable,
            }));
    return i;
  },
  s = (t) =>
    r.call(t, `module.exports`)
      ? t[`module.exports`]
      : o(e({}, `__esModule`, { value: !0 }), t);
(function () {
  let e = document.createElement(`link`).relList;
  if (e && e.supports && e.supports(`modulepreload`)) return;
  for (let e of document.querySelectorAll(`link[rel="modulepreload"]`)) n(e);
  new MutationObserver((e) => {
    for (let t of e)
      if (t.type === `childList`)
        for (let e of t.addedNodes)
          e.tagName === `LINK` && e.rel === `modulepreload` && n(e);
  }).observe(document, { childList: !0, subtree: !0 });
  function t(e) {
    let t = {};
    return (
      e.integrity && (t.integrity = e.integrity),
      e.referrerPolicy && (t.referrerPolicy = e.referrerPolicy),
      e.crossOrigin === `use-credentials`
        ? (t.credentials = `include`)
        : e.crossOrigin === `anonymous`
          ? (t.credentials = `omit`)
          : (t.credentials = `same-origin`),
      t
    );
  }
  function n(e) {
    if (e.ep) return;
    e.ep = !0;
    let n = t(e);
    fetch(e.href, n);
  }
})();
var c = i((e, t) => {
    function n(e) {
      var t = new a(e),
        n = t.readChunk();
      if (n.id != `MThd`) throw `Bad MIDI file.  Expected 'MHdr', got: '` + n.id + `'`;
      for (var o = r(n.data), s = [], c = 0; !t.eof() && c < o.numTracks; c++) {
        var l = t.readChunk();
        if (l.id != `MTrk`) throw `Bad MIDI file.  Expected 'MTrk', got: '` + l.id + `'`;
        var u = i(l.data);
        s.push(u);
      }
      return { header: o, tracks: s };
    }
    function r(e) {
      var t = new a(e),
        n = { format: t.readUInt16(), numTracks: t.readUInt16() },
        r = t.readUInt16();
      return (
        r & 32768
          ? ((n.framesPerSecond = 256 - (r >> 8)), (n.ticksPerFrame = r & 255))
          : (n.ticksPerBeat = r),
        n
      );
    }
    function i(e) {
      for (var t = new a(e), n = []; !t.eof();) {
        var r = i();
        n.push(r);
      }
      return n;
      function i() {
        var e = {};
        e.deltaTime = t.readVarInt();
        var n = t.readUInt8();
        if ((n & 240) == 240)
          if (n === 255) {
            e.meta = !0;
            var r = t.readUInt8(),
              i = t.readVarInt();
            switch (r) {
              case 0:
                if (((e.type = `sequenceNumber`), i !== 2))
                  throw `Expected length for sequenceNumber event is 2, got ` + i;
                return ((e.number = t.readUInt16()), e);
              case 1:
                return ((e.type = `text`), (e.text = t.readString(i)), e);
              case 2:
                return ((e.type = `copyrightNotice`), (e.text = t.readString(i)), e);
              case 3:
                return ((e.type = `trackName`), (e.text = t.readString(i)), e);
              case 4:
                return ((e.type = `instrumentName`), (e.text = t.readString(i)), e);
              case 5:
                return ((e.type = `lyrics`), (e.text = t.readString(i)), e);
              case 6:
                return ((e.type = `marker`), (e.text = t.readString(i)), e);
              case 7:
                return ((e.type = `cuePoint`), (e.text = t.readString(i)), e);
              case 32:
                if (((e.type = `channelPrefix`), i != 1))
                  throw `Expected length for channelPrefix event is 1, got ` + i;
                return ((e.channel = t.readUInt8()), e);
              case 33:
                if (((e.type = `portPrefix`), i != 1))
                  throw `Expected length for portPrefix event is 1, got ` + i;
                return ((e.port = t.readUInt8()), e);
              case 47:
                if (((e.type = `endOfTrack`), i != 0))
                  throw `Expected length for endOfTrack event is 0, got ` + i;
                return e;
              case 81:
                if (((e.type = `setTempo`), i != 3))
                  throw `Expected length for setTempo event is 3, got ` + i;
                return ((e.microsecondsPerBeat = t.readUInt24()), e);
              case 84:
                if (((e.type = `smpteOffset`), i != 5))
                  throw `Expected length for smpteOffset event is 5, got ` + i;
                var a = t.readUInt8();
                return (
                  (e.frameRate = { 0: 24, 32: 25, 64: 29, 96: 30 }[a & 96]),
                  (e.hour = a & 31),
                  (e.min = t.readUInt8()),
                  (e.sec = t.readUInt8()),
                  (e.frame = t.readUInt8()),
                  (e.subFrame = t.readUInt8()),
                  e
                );
              case 88:
                if (((e.type = `timeSignature`), i != 2 && i != 4))
                  throw `Expected length for timeSignature event is 4 or 2, got ` + i;
                return (
                  (e.numerator = t.readUInt8()),
                  (e.denominator = 1 << t.readUInt8()),
                  i === 4
                    ? ((e.metronome = t.readUInt8()), (e.thirtyseconds = t.readUInt8()))
                    : ((e.metronome = 36), (e.thirtyseconds = 8)),
                  e
                );
              case 89:
                if (((e.type = `keySignature`), i != 2))
                  throw `Expected length for keySignature event is 2, got ` + i;
                return ((e.key = t.readInt8()), (e.scale = t.readUInt8()), e);
              case 127:
                return ((e.type = `sequencerSpecific`), (e.data = t.readBytes(i)), e);
              default:
                return (
                  (e.type = `unknownMeta`),
                  (e.data = t.readBytes(i)),
                  (e.metatypeByte = r),
                  e
                );
            }
          } else if (n == 240) {
            e.type = `sysEx`;
            var i = t.readVarInt();
            return ((e.data = t.readBytes(i)), e);
          } else if (n == 247) {
            e.type = `endSysEx`;
            var i = t.readVarInt();
            return ((e.data = t.readBytes(i)), e);
          } else throw `Unrecognised MIDI event type byte: ` + n;
        else {
          var s;
          if (n & 128) ((s = t.readUInt8()), (o = n));
          else {
            if (o === null) throw `Running status byte encountered before status byte`;
            ((s = n), (n = o), (e.running = !0));
          }
          var c = n >> 4;
          switch (((e.channel = n & 15), c)) {
            case 8:
              return (
                (e.type = `noteOff`),
                (e.noteNumber = s),
                (e.velocity = t.readUInt8()),
                e
              );
            case 9:
              var l = t.readUInt8();
              return (
                (e.type = l === 0 ? `noteOff` : `noteOn`),
                (e.noteNumber = s),
                (e.velocity = l),
                l === 0 && (e.byte9 = !0),
                e
              );
            case 10:
              return (
                (e.type = `noteAftertouch`),
                (e.noteNumber = s),
                (e.amount = t.readUInt8()),
                e
              );
            case 11:
              return (
                (e.type = `controller`),
                (e.controllerType = s),
                (e.value = t.readUInt8()),
                e
              );
            case 12:
              return ((e.type = `programChange`), (e.programNumber = s), e);
            case 13:
              return ((e.type = `channelAftertouch`), (e.amount = s), e);
            case 14:
              return (
                (e.type = `pitchBend`),
                (e.value = s + (t.readUInt8() << 7) - 8192),
                e
              );
            default:
              throw `Unrecognised MIDI event type: ` + c;
          }
        }
      }
      var o;
    }
    function a(e) {
      ((this.buffer = e), (this.bufferLen = this.buffer.length), (this.pos = 0));
    }
    ((a.prototype.eof = function () {
      return this.pos >= this.bufferLen;
    }),
      (a.prototype.readUInt8 = function () {
        var e = this.buffer[this.pos];
        return ((this.pos += 1), e);
      }),
      (a.prototype.readInt8 = function () {
        var e = this.readUInt8();
        return e & 128 ? e - 256 : e;
      }),
      (a.prototype.readUInt16 = function () {
        var e = this.readUInt8(),
          t = this.readUInt8();
        return (e << 8) + t;
      }),
      (a.prototype.readInt16 = function () {
        var e = this.readUInt16();
        return e & 32768 ? e - 65536 : e;
      }),
      (a.prototype.readUInt24 = function () {
        var e = this.readUInt8(),
          t = this.readUInt8(),
          n = this.readUInt8();
        return (e << 16) + (t << 8) + n;
      }),
      (a.prototype.readInt24 = function () {
        var e = this.readUInt24();
        return e & 8388608 ? e - 16777216 : e;
      }),
      (a.prototype.readUInt32 = function () {
        var e = this.readUInt8(),
          t = this.readUInt8(),
          n = this.readUInt8(),
          r = this.readUInt8();
        return (e << 24) + (t << 16) + (n << 8) + r;
      }),
      (a.prototype.readBytes = function (e) {
        var t = this.buffer.slice(this.pos, this.pos + e);
        return ((this.pos += e), t);
      }),
      (a.prototype.readString = function (e) {
        var t = this.readBytes(e);
        return String.fromCharCode.apply(null, t);
      }),
      (a.prototype.readVarInt = function () {
        for (var e = 0; !this.eof();) {
          var t = this.readUInt8();
          if (t & 128) ((e += t & 127), (e <<= 7));
          else return e + t;
        }
        return e;
      }),
      (a.prototype.readChunk = function () {
        var e = this.readString(4),
          t = this.readUInt32();
        return { id: e, length: t, data: this.readBytes(t) };
      }),
      (t.exports = n));
  }),
  l = i((e, t) => {
    function n(e, t) {
      if (typeof e != `object`) throw `Invalid MIDI data`;
      t ||= {};
      var n = e.header || {},
        a = e.tracks || [],
        s,
        c = a.length,
        l = new o();
      for (r(l, n, c), s = 0; s < c; s++) i(l, a[s], t);
      return l.buffer;
    }
    function r(e, t, n) {
      var r = t.format == null ? 1 : t.format,
        i = 128;
      t.timeDivision
        ? (i = t.timeDivision)
        : t.ticksPerFrame && t.framesPerSecond
          ? (i = (-(t.framesPerSecond & 255) << 8) | (t.ticksPerFrame & 255))
          : t.ticksPerBeat && (i = t.ticksPerBeat & 32767);
      var a = new o();
      (a.writeUInt16(r),
        a.writeUInt16(n),
        a.writeUInt16(i),
        e.writeChunk(`MThd`, a.buffer));
    }
    function i(e, t, n) {
      var r = new o(),
        i,
        s = t.length,
        c = null;
      for (i = 0; i < s; i++)
        ((n.running === !1 || (!n.running && !t[i].running)) && (c = null),
          (c = a(r, t[i], c, n.useByte9ForNoteOff)));
      e.writeChunk(`MTrk`, r.buffer);
    }
    function a(e, t, n, r) {
      var i = t.type,
        a = t.deltaTime,
        o = t.text || ``,
        s = t.data || [],
        c = null;
      switch ((e.writeVarInt(a), i)) {
        case `sequenceNumber`:
          (e.writeUInt8(255), e.writeUInt8(0), e.writeVarInt(2), e.writeUInt16(t.number));
          break;
        case `text`:
          (e.writeUInt8(255), e.writeUInt8(1), e.writeVarInt(o.length), e.writeString(o));
          break;
        case `copyrightNotice`:
          (e.writeUInt8(255), e.writeUInt8(2), e.writeVarInt(o.length), e.writeString(o));
          break;
        case `trackName`:
          (e.writeUInt8(255), e.writeUInt8(3), e.writeVarInt(o.length), e.writeString(o));
          break;
        case `instrumentName`:
          (e.writeUInt8(255), e.writeUInt8(4), e.writeVarInt(o.length), e.writeString(o));
          break;
        case `lyrics`:
          (e.writeUInt8(255), e.writeUInt8(5), e.writeVarInt(o.length), e.writeString(o));
          break;
        case `marker`:
          (e.writeUInt8(255), e.writeUInt8(6), e.writeVarInt(o.length), e.writeString(o));
          break;
        case `cuePoint`:
          (e.writeUInt8(255), e.writeUInt8(7), e.writeVarInt(o.length), e.writeString(o));
          break;
        case `channelPrefix`:
          (e.writeUInt8(255),
            e.writeUInt8(32),
            e.writeVarInt(1),
            e.writeUInt8(t.channel));
          break;
        case `portPrefix`:
          (e.writeUInt8(255), e.writeUInt8(33), e.writeVarInt(1), e.writeUInt8(t.port));
          break;
        case `endOfTrack`:
          (e.writeUInt8(255), e.writeUInt8(47), e.writeVarInt(0));
          break;
        case `setTempo`:
          (e.writeUInt8(255),
            e.writeUInt8(81),
            e.writeVarInt(3),
            e.writeUInt24(t.microsecondsPerBeat));
          break;
        case `smpteOffset`:
          (e.writeUInt8(255), e.writeUInt8(84), e.writeVarInt(5));
          var l = (t.hour & 31) | { 24: 0, 25: 32, 29: 64, 30: 96 }[t.frameRate];
          (e.writeUInt8(l),
            e.writeUInt8(t.min),
            e.writeUInt8(t.sec),
            e.writeUInt8(t.frame),
            e.writeUInt8(t.subFrame));
          break;
        case `timeSignature`:
          (e.writeUInt8(255),
            e.writeUInt8(88),
            e.writeVarInt(4),
            e.writeUInt8(t.numerator));
          var u = Math.floor(Math.log(t.denominator) / Math.LN2) & 255;
          (e.writeUInt8(u),
            e.writeUInt8(t.metronome),
            e.writeUInt8(t.thirtyseconds || 8));
          break;
        case `keySignature`:
          (e.writeUInt8(255),
            e.writeUInt8(89),
            e.writeVarInt(2),
            e.writeInt8(t.key),
            e.writeUInt8(t.scale));
          break;
        case `sequencerSpecific`:
          (e.writeUInt8(255),
            e.writeUInt8(127),
            e.writeVarInt(s.length),
            e.writeBytes(s));
          break;
        case `unknownMeta`:
          t.metatypeByte != null &&
            (e.writeUInt8(255),
            e.writeUInt8(t.metatypeByte),
            e.writeVarInt(s.length),
            e.writeBytes(s));
          break;
        case `sysEx`:
          (e.writeUInt8(240), e.writeVarInt(s.length), e.writeBytes(s));
          break;
        case `endSysEx`:
          (e.writeUInt8(247), e.writeVarInt(s.length), e.writeBytes(s));
          break;
        case `noteOff`:
          ((c =
            ((r !== !1 && t.byte9) || (r && t.velocity == 0) ? 144 : 128) | t.channel),
            c !== n && e.writeUInt8(c),
            e.writeUInt8(t.noteNumber),
            e.writeUInt8(t.velocity));
          break;
        case `noteOn`:
          ((c = 144 | t.channel),
            c !== n && e.writeUInt8(c),
            e.writeUInt8(t.noteNumber),
            e.writeUInt8(t.velocity));
          break;
        case `noteAftertouch`:
          ((c = 160 | t.channel),
            c !== n && e.writeUInt8(c),
            e.writeUInt8(t.noteNumber),
            e.writeUInt8(t.amount));
          break;
        case `controller`:
          ((c = 176 | t.channel),
            c !== n && e.writeUInt8(c),
            e.writeUInt8(t.controllerType),
            e.writeUInt8(t.value));
          break;
        case `programChange`:
          ((c = 192 | t.channel),
            c !== n && e.writeUInt8(c),
            e.writeUInt8(t.programNumber));
          break;
        case `channelAftertouch`:
          ((c = 208 | t.channel), c !== n && e.writeUInt8(c), e.writeUInt8(t.amount));
          break;
        case `pitchBend`:
          ((c = 224 | t.channel), c !== n && e.writeUInt8(c));
          var d = 8192 + t.value,
            f = d & 127,
            p = (d >> 7) & 127;
          (e.writeUInt8(f), e.writeUInt8(p));
          break;
        default:
          throw `Unrecognized event type: ` + i;
      }
      return c;
    }
    function o() {
      this.buffer = [];
    }
    ((o.prototype.writeUInt8 = function (e) {
      this.buffer.push(e & 255);
    }),
      (o.prototype.writeInt8 = o.prototype.writeUInt8),
      (o.prototype.writeUInt16 = function (e) {
        var t = (e >> 8) & 255,
          n = e & 255;
        (this.writeUInt8(t), this.writeUInt8(n));
      }),
      (o.prototype.writeInt16 = o.prototype.writeUInt16),
      (o.prototype.writeUInt24 = function (e) {
        var t = (e >> 16) & 255,
          n = (e >> 8) & 255,
          r = e & 255;
        (this.writeUInt8(t), this.writeUInt8(n), this.writeUInt8(r));
      }),
      (o.prototype.writeInt24 = o.prototype.writeUInt24),
      (o.prototype.writeUInt32 = function (e) {
        var t = (e >> 24) & 255,
          n = (e >> 16) & 255,
          r = (e >> 8) & 255,
          i = e & 255;
        (this.writeUInt8(t), this.writeUInt8(n), this.writeUInt8(r), this.writeUInt8(i));
      }),
      (o.prototype.writeInt32 = o.prototype.writeUInt32),
      (o.prototype.writeBytes = function (e) {
        this.buffer = this.buffer.concat(Array.prototype.slice.call(e, 0));
      }),
      (o.prototype.writeString = function (e) {
        var t,
          n = e.length,
          r = [];
        for (t = 0; t < n; t++) r.push(e.codePointAt(t));
        this.writeBytes(r);
      }),
      (o.prototype.writeVarInt = function (e) {
        if (e < 0) throw `Cannot write negative variable-length integer`;
        if (e <= 127) this.writeUInt8(e);
        else {
          var t = e,
            n = [];
          for (n.push(t & 127), t >>= 7; t;) {
            var r = (t & 127) | 128;
            (n.push(r), (t >>= 7));
          }
          this.writeBytes(n.reverse());
        }
      }),
      (o.prototype.writeChunk = function (e, t) {
        (this.writeString(e), this.writeUInt32(t.length), this.writeBytes(t));
      }),
      (t.exports = n));
  }),
  u = i((e) => {
    ((e.parseMidi = c()), (e.writeMidi = l()));
  }),
  d = i((e) => {
    (Object.defineProperty(e, '__esModule', { value: !0 }),
      (e.insert = e.search = void 0));
    function t(e, t, n) {
      n === void 0 && (n = `ticks`);
      var r = 0,
        i = e.length,
        a = i;
      if (i > 0 && e[i - 1][n] <= t) return i - 1;
      for (; r < a;) {
        var o = Math.floor(r + (a - r) / 2),
          s = e[o],
          c = e[o + 1];
        if (s[n] === t) {
          for (var l = o; l < e.length; l++) e[l][n] === t && (o = l);
          return o;
        } else if (s[n] < t && c[n] > t) return o;
        else s[n] > t ? (a = o) : s[n] < t && (r = o + 1);
      }
      return -1;
    }
    e.search = t;
    function n(e, n, r) {
      if ((r === void 0 && (r = `ticks`), e.length)) {
        var i = t(e, n[r], r);
        e.splice(i + 1, 0, n);
      } else e.push(n);
    }
    e.insert = n;
  }),
  f = i((e) => {
    (Object.defineProperty(e, '__esModule', { value: !0 }),
      (e.Header = e.keySignatureKeys = void 0));
    var t = d(),
      n = new WeakMap();
    ((e.keySignatureKeys = [
      `Cb`,
      `Gb`,
      `Db`,
      `Ab`,
      `Eb`,
      `Bb`,
      `F`,
      `C`,
      `G`,
      `D`,
      `A`,
      `E`,
      `B`,
      `F#`,
      `C#`,
    ]),
      (e.Header = (function () {
        function r(t) {
          var r = this;
          if (
            ((this.tempos = []),
            (this.timeSignatures = []),
            (this.keySignatures = []),
            (this.meta = []),
            (this.name = ``),
            n.set(this, 480),
            t)
          ) {
            (n.set(this, t.header.ticksPerBeat),
              t.tracks.forEach(function (t) {
                t.forEach(function (t) {
                  t.meta &&
                    (t.type === `timeSignature`
                      ? r.timeSignatures.push({
                          ticks: t.absoluteTime,
                          timeSignature: [t.numerator, t.denominator],
                        })
                      : t.type === `setTempo`
                        ? r.tempos.push({
                            bpm: 6e7 / t.microsecondsPerBeat,
                            ticks: t.absoluteTime,
                          })
                        : t.type === `keySignature` &&
                          r.keySignatures.push({
                            key: e.keySignatureKeys[t.key + 7],
                            scale: t.scale === 0 ? `major` : `minor`,
                            ticks: t.absoluteTime,
                          }));
                });
              }));
            var i = 0;
            (t.tracks[0].forEach(function (e) {
              ((i += e.deltaTime),
                e.meta &&
                  (e.type === `trackName`
                    ? (r.name = e.text)
                    : (e.type === `text` ||
                        e.type === `cuePoint` ||
                        e.type === `marker` ||
                        e.type === `lyrics`) &&
                      r.meta.push({ text: e.text, ticks: i, type: e.type })));
            }),
              this.update());
          }
        }
        return (
          (r.prototype.update = function () {
            var e = this,
              t = 0,
              n = 0;
            (this.tempos.sort(function (e, t) {
              return e.ticks - t.ticks;
            }),
              this.tempos.forEach(function (r, i) {
                var a = i > 0 ? e.tempos[i - 1].bpm : e.tempos[0].bpm,
                  o = r.ticks / e.ppq - n;
                ((r.time = (60 / a) * o + t), (t = r.time), (n += o));
              }),
              this.timeSignatures.sort(function (e, t) {
                return e.ticks - t.ticks;
              }),
              this.timeSignatures.forEach(function (t, n) {
                var r = n > 0 ? e.timeSignatures[n - 1] : e.timeSignatures[0],
                  i =
                    (t.ticks - r.ticks) /
                    e.ppq /
                    r.timeSignature[0] /
                    (r.timeSignature[1] / 4);
                ((r.measures = r.measures || 0), (t.measures = i + r.measures));
              }));
          }),
          (r.prototype.ticksToSeconds = function (e) {
            var n = (0, t.search)(this.tempos, e);
            if (n !== -1) {
              var r = this.tempos[n],
                i = r.time,
                a = (e - r.ticks) / this.ppq;
              return i + (60 / r.bpm) * a;
            } else return (60 / 120) * (e / this.ppq);
          }),
          (r.prototype.ticksToMeasures = function (e) {
            var n = (0, t.search)(this.timeSignatures, e);
            if (n !== -1) {
              var r = this.timeSignatures[n],
                i = (e - r.ticks) / this.ppq;
              return r.measures + i / (r.timeSignature[0] / r.timeSignature[1]) / 4;
            } else return e / this.ppq / 4;
          }),
          Object.defineProperty(r.prototype, 'ppq', {
            get: function () {
              return n.get(this);
            },
            enumerable: !1,
            configurable: !0,
          }),
          (r.prototype.secondsToTicks = function (e) {
            var n = (0, t.search)(this.tempos, e, `time`);
            if (n !== -1) {
              var r = this.tempos[n],
                i = (e - r.time) / (60 / r.bpm);
              return Math.round(r.ticks + i * this.ppq);
            } else {
              var a = e / (60 / 120);
              return Math.round(a * this.ppq);
            }
          }),
          (r.prototype.toJSON = function () {
            return {
              keySignatures: this.keySignatures,
              meta: this.meta,
              name: this.name,
              ppq: this.ppq,
              tempos: this.tempos.map(function (e) {
                return { bpm: e.bpm, ticks: e.ticks };
              }),
              timeSignatures: this.timeSignatures,
            };
          }),
          (r.prototype.fromJSON = function (e) {
            ((this.name = e.name),
              (this.tempos = e.tempos.map(function (e) {
                return Object.assign({}, e);
              })),
              (this.timeSignatures = e.timeSignatures.map(function (e) {
                return Object.assign({}, e);
              })),
              (this.keySignatures = e.keySignatures.map(function (e) {
                return Object.assign({}, e);
              })),
              (this.meta = e.meta.map(function (e) {
                return Object.assign({}, e);
              })),
              n.set(this, e.ppq),
              this.update());
          }),
          (r.prototype.setTempo = function (e) {
            ((this.tempos = [{ bpm: e, ticks: 0 }]), this.update());
          }),
          r
        );
      })()));
  }),
  p = i((e) => {
    (Object.defineProperty(e, '__esModule', { value: !0 }),
      (e.ControlChange = e.controlChangeIds = e.controlChangeNames = void 0),
      (e.controlChangeNames = {
        1: `modulationWheel`,
        2: `breath`,
        4: `footController`,
        5: `portamentoTime`,
        7: `volume`,
        8: `balance`,
        10: `pan`,
        64: `sustain`,
        65: `portamentoTime`,
        66: `sostenuto`,
        67: `softPedal`,
        68: `legatoFootswitch`,
        84: `portamentoControl`,
      }),
      (e.controlChangeIds = Object.keys(e.controlChangeNames).reduce(function (t, n) {
        return ((t[e.controlChangeNames[n]] = n), t);
      }, {})));
    var t = new WeakMap(),
      n = new WeakMap();
    e.ControlChange = (function () {
      function r(e, r) {
        (t.set(this, r),
          n.set(this, e.controllerType),
          (this.ticks = e.absoluteTime),
          (this.value = e.value));
      }
      return (
        Object.defineProperty(r.prototype, 'number', {
          get: function () {
            return n.get(this);
          },
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(r.prototype, 'name', {
          get: function () {
            return e.controlChangeNames[this.number]
              ? e.controlChangeNames[this.number]
              : null;
          },
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(r.prototype, 'time', {
          get: function () {
            return t.get(this).ticksToSeconds(this.ticks);
          },
          set: function (e) {
            var n = t.get(this);
            this.ticks = n.secondsToTicks(e);
          },
          enumerable: !1,
          configurable: !0,
        }),
        (r.prototype.toJSON = function () {
          return {
            number: this.number,
            ticks: this.ticks,
            time: this.time,
            value: this.value,
          };
        }),
        r
      );
    })();
  }),
  m = i((e) => {
    (Object.defineProperty(e, '__esModule', { value: !0 }),
      (e.createControlChanges = void 0));
    var t = p();
    function n() {
      return new Proxy(
        {},
        {
          get: function (e, n) {
            if (e[n]) return e[n];
            if (t.controlChangeIds.hasOwnProperty(n)) return e[t.controlChangeIds[n]];
          },
          set: function (e, n, r) {
            return (
              t.controlChangeIds.hasOwnProperty(n)
                ? (e[t.controlChangeIds[n]] = r)
                : (e[n] = r),
              !0
            );
          },
        },
      );
    }
    e.createControlChanges = n;
  }),
  h = i((e) => {
    (Object.defineProperty(e, '__esModule', { value: !0 }), (e.PitchBend = void 0));
    var t = new WeakMap();
    e.PitchBend = (function () {
      function e(e, n) {
        (t.set(this, n), (this.ticks = e.absoluteTime), (this.value = e.value));
      }
      return (
        Object.defineProperty(e.prototype, 'time', {
          get: function () {
            return t.get(this).ticksToSeconds(this.ticks);
          },
          set: function (e) {
            var n = t.get(this);
            this.ticks = n.secondsToTicks(e);
          },
          enumerable: !1,
          configurable: !0,
        }),
        (e.prototype.toJSON = function () {
          return { ticks: this.ticks, time: this.time, value: this.value };
        }),
        e
      );
    })();
  }),
  g = i((e) => {
    (Object.defineProperty(e, '__esModule', { value: !0 }),
      (e.DrumKitByPatchID = e.InstrumentFamilyByID = e.instrumentByPatchID = void 0),
      (e.instrumentByPatchID =
        `acoustic grand piano.bright acoustic piano.electric grand piano.honky-tonk piano.electric piano 1.electric piano 2.harpsichord.clavi.celesta.glockenspiel.music box.vibraphone.marimba.xylophone.tubular bells.dulcimer.drawbar organ.percussive organ.rock organ.church organ.reed organ.accordion.harmonica.tango accordion.acoustic guitar (nylon).acoustic guitar (steel).electric guitar (jazz).electric guitar (clean).electric guitar (muted).overdriven guitar.distortion guitar.guitar harmonics.acoustic bass.electric bass (finger).electric bass (pick).fretless bass.slap bass 1.slap bass 2.synth bass 1.synth bass 2.violin.viola.cello.contrabass.tremolo strings.pizzicato strings.orchestral harp.timpani.string ensemble 1.string ensemble 2.synthstrings 1.synthstrings 2.choir aahs.voice oohs.synth voice.orchestra hit.trumpet.trombone.tuba.muted trumpet.french horn.brass section.synthbrass 1.synthbrass 2.soprano sax.alto sax.tenor sax.baritone sax.oboe.english horn.bassoon.clarinet.piccolo.flute.recorder.pan flute.blown bottle.shakuhachi.whistle.ocarina.lead 1 (square).lead 2 (sawtooth).lead 3 (calliope).lead 4 (chiff).lead 5 (charang).lead 6 (voice).lead 7 (fifths).lead 8 (bass + lead).pad 1 (new age).pad 2 (warm).pad 3 (polysynth).pad 4 (choir).pad 5 (bowed).pad 6 (metallic).pad 7 (halo).pad 8 (sweep).fx 1 (rain).fx 2 (soundtrack).fx 3 (crystal).fx 4 (atmosphere).fx 5 (brightness).fx 6 (goblins).fx 7 (echoes).fx 8 (sci-fi).sitar.banjo.shamisen.koto.kalimba.bag pipe.fiddle.shanai.tinkle bell.agogo.steel drums.woodblock.taiko drum.melodic tom.synth drum.reverse cymbal.guitar fret noise.breath noise.seashore.bird tweet.telephone ring.helicopter.applause.gunshot`.split(
          `.`,
        )),
      (e.InstrumentFamilyByID = [
        `piano`,
        `chromatic percussion`,
        `organ`,
        `guitar`,
        `bass`,
        `strings`,
        `ensemble`,
        `brass`,
        `reed`,
        `pipe`,
        `synth lead`,
        `synth pad`,
        `synth effects`,
        `world`,
        `percussive`,
        `sound effects`,
      ]),
      (e.DrumKitByPatchID = {
        0: `standard kit`,
        8: `room kit`,
        16: `power kit`,
        24: `electronic kit`,
        25: `tr-808 kit`,
        32: `jazz kit`,
        40: `brush kit`,
        48: `orchestra kit`,
        56: `sound fx kit`,
      }));
  }),
  _ = i((e) => {
    (Object.defineProperty(e, '__esModule', { value: !0 }), (e.Instrument = void 0));
    var t = g(),
      n = new WeakMap();
    e.Instrument = (function () {
      function e(e, t) {
        if (((this.number = 0), n.set(this, t), (this.number = 0), e)) {
          var r = e.find(function (e) {
            return e.type === `programChange`;
          });
          r && (this.number = r.programNumber);
        }
      }
      return (
        Object.defineProperty(e.prototype, 'name', {
          get: function () {
            return this.percussion
              ? t.DrumKitByPatchID[this.number]
              : t.instrumentByPatchID[this.number];
          },
          set: function (e) {
            var n = t.instrumentByPatchID.indexOf(e);
            n !== -1 && (this.number = n);
          },
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(e.prototype, 'family', {
          get: function () {
            return this.percussion
              ? `drums`
              : t.InstrumentFamilyByID[Math.floor(this.number / 8)];
          },
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(e.prototype, 'percussion', {
          get: function () {
            return n.get(this).channel === 9;
          },
          enumerable: !1,
          configurable: !0,
        }),
        (e.prototype.toJSON = function () {
          return { family: this.family, number: this.number, name: this.name };
        }),
        (e.prototype.fromJSON = function (e) {
          this.number = e.number;
        }),
        e
      );
    })();
  }),
  v = i((e) => {
    (Object.defineProperty(e, '__esModule', { value: !0 }), (e.Note = void 0));
    function t(e) {
      var t = Math.floor(e / 12) - 1;
      return n(e) + t.toString();
    }
    function n(e) {
      return [`C`, `C#`, `D`, `D#`, `E`, `F`, `F#`, `G`, `G#`, `A`, `A#`, `B`][e % 12];
    }
    function r(e) {
      return [`C`, `C#`, `D`, `D#`, `E`, `F`, `F#`, `G`, `G#`, `A`, `A#`, `B`].indexOf(e);
    }
    var i = (function () {
        var e = /^([a-g]{1}(?:b|#|x|bb)?)(-?[0-9]+)/i,
          t = {
            cbb: -2,
            cb: -1,
            c: 0,
            'c#': 1,
            cx: 2,
            dbb: 0,
            db: 1,
            d: 2,
            'd#': 3,
            dx: 4,
            ebb: 2,
            eb: 3,
            e: 4,
            'e#': 5,
            ex: 6,
            fbb: 3,
            fb: 4,
            f: 5,
            'f#': 6,
            fx: 7,
            gbb: 5,
            gb: 6,
            g: 7,
            'g#': 8,
            gx: 9,
            abb: 7,
            ab: 8,
            a: 9,
            'a#': 10,
            ax: 11,
            bbb: 9,
            bb: 10,
            b: 11,
            'b#': 12,
            bx: 13,
          };
        return function (n) {
          var r = e.exec(n),
            i = r[1],
            a = r[2];
          return t[i.toLowerCase()] + (parseInt(a, 10) + 1) * 12;
        };
      })(),
      a = new WeakMap();
    e.Note = (function () {
      function e(e, t, n) {
        (a.set(this, n),
          (this.midi = e.midi),
          (this.velocity = e.velocity),
          (this.noteOffVelocity = t.velocity),
          (this.ticks = e.ticks),
          (this.durationTicks = t.ticks - e.ticks));
      }
      return (
        Object.defineProperty(e.prototype, 'name', {
          get: function () {
            return t(this.midi);
          },
          set: function (e) {
            this.midi = i(e);
          },
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(e.prototype, 'octave', {
          get: function () {
            return Math.floor(this.midi / 12) - 1;
          },
          set: function (e) {
            var t = e - this.octave;
            this.midi += t * 12;
          },
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(e.prototype, 'pitch', {
          get: function () {
            return n(this.midi);
          },
          set: function (e) {
            this.midi = 12 * (this.octave + 1) + r(e);
          },
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(e.prototype, 'duration', {
          get: function () {
            var e = a.get(this);
            return (
              e.ticksToSeconds(this.ticks + this.durationTicks) -
              e.ticksToSeconds(this.ticks)
            );
          },
          set: function (e) {
            var t = a.get(this).secondsToTicks(this.time + e);
            this.durationTicks = t - this.ticks;
          },
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(e.prototype, 'time', {
          get: function () {
            return a.get(this).ticksToSeconds(this.ticks);
          },
          set: function (e) {
            var t = a.get(this);
            this.ticks = t.secondsToTicks(e);
          },
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(e.prototype, 'bars', {
          get: function () {
            return a.get(this).ticksToMeasures(this.ticks);
          },
          enumerable: !1,
          configurable: !0,
        }),
        (e.prototype.toJSON = function () {
          return {
            duration: this.duration,
            durationTicks: this.durationTicks,
            midi: this.midi,
            name: this.name,
            ticks: this.ticks,
            time: this.time,
            velocity: this.velocity,
          };
        }),
        e
      );
    })();
  }),
  y = i((e) => {
    (Object.defineProperty(e, '__esModule', { value: !0 }), (e.Track = void 0));
    var t = d(),
      n = p(),
      r = m(),
      i = h(),
      a = _(),
      o = v(),
      s = new WeakMap();
    e.Track = (function () {
      function e(e, t) {
        var n = this;
        if (
          ((this.name = ``),
          (this.notes = []),
          (this.controlChanges = (0, r.createControlChanges)()),
          (this.pitchBends = []),
          s.set(this, t),
          e)
        ) {
          var i = e.find(function (e) {
            return e.type === `trackName`;
          });
          this.name = i ? i.text : ``;
        }
        if (((this.instrument = new a.Instrument(e, this)), (this.channel = 0), e)) {
          for (
            var o = e.filter(function (e) {
                return e.type === `noteOn`;
              }),
              c = e.filter(function (e) {
                return e.type === `noteOff`;
              }),
              l = function () {
                var e = o.shift();
                u.channel = e.channel;
                var t = c.findIndex(function (t) {
                  return (
                    t.noteNumber === e.noteNumber && t.absoluteTime >= e.absoluteTime
                  );
                });
                if (t !== -1) {
                  var n = c.splice(t, 1)[0];
                  u.addNote({
                    durationTicks: n.absoluteTime - e.absoluteTime,
                    midi: e.noteNumber,
                    noteOffVelocity: n.velocity / 127,
                    ticks: e.absoluteTime,
                    velocity: e.velocity / 127,
                  });
                }
              },
              u = this;
            o.length;
          )
            l();
          (e
            .filter(function (e) {
              return e.type === `controller`;
            })
            .forEach(function (e) {
              n.addCC({
                number: e.controllerType,
                ticks: e.absoluteTime,
                value: e.value / 127,
              });
            }),
            e
              .filter(function (e) {
                return e.type === `pitchBend`;
              })
              .forEach(function (e) {
                n.addPitchBend({ ticks: e.absoluteTime, value: e.value / 2 ** 13 });
              }));
          var d = e.find(function (e) {
            return e.type === `endOfTrack`;
          });
          this.endOfTrackTicks = d === void 0 ? void 0 : d.absoluteTime;
        }
      }
      return (
        (e.prototype.addNote = function (e) {
          var n = s.get(this),
            r = new o.Note(
              { midi: 0, ticks: 0, velocity: 1 },
              { ticks: 0, velocity: 0 },
              n,
            );
          return (Object.assign(r, e), (0, t.insert)(this.notes, r, `ticks`), this);
        }),
        (e.prototype.addCC = function (e) {
          var r = s.get(this),
            i = new n.ControlChange({ controllerType: e.number }, r);
          return (
            delete e.number,
            Object.assign(i, e),
            Array.isArray(this.controlChanges[i.number]) ||
              (this.controlChanges[i.number] = []),
            (0, t.insert)(this.controlChanges[i.number], i, `ticks`),
            this
          );
        }),
        (e.prototype.addPitchBend = function (e) {
          var n = s.get(this),
            r = new i.PitchBend({}, n);
          return (Object.assign(r, e), (0, t.insert)(this.pitchBends, r, `ticks`), this);
        }),
        Object.defineProperty(e.prototype, 'duration', {
          get: function () {
            if (!this.notes.length) return 0;
            for (
              var e =
                  this.notes[this.notes.length - 1].time +
                  this.notes[this.notes.length - 1].duration,
                t = 0;
              t < this.notes.length - 1;
              t++
            ) {
              var n = this.notes[t].time + this.notes[t].duration;
              e < n && (e = n);
            }
            return e;
          },
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(e.prototype, 'durationTicks', {
          get: function () {
            if (!this.notes.length) return 0;
            for (
              var e =
                  this.notes[this.notes.length - 1].ticks +
                  this.notes[this.notes.length - 1].durationTicks,
                t = 0;
              t < this.notes.length - 1;
              t++
            ) {
              var n = this.notes[t].ticks + this.notes[t].durationTicks;
              e < n && (e = n);
            }
            return e;
          },
          enumerable: !1,
          configurable: !0,
        }),
        (e.prototype.fromJSON = function (e) {
          var t = this;
          for (var n in ((this.name = e.name),
          (this.channel = e.channel),
          (this.instrument = new a.Instrument(void 0, this)),
          this.instrument.fromJSON(e.instrument),
          e.endOfTrackTicks !== void 0 && (this.endOfTrackTicks = e.endOfTrackTicks),
          e.controlChanges))
            e.controlChanges[n] &&
              e.controlChanges[n].forEach(function (e) {
                t.addCC({ number: e.number, ticks: e.ticks, value: e.value });
              });
          e.notes.forEach(function (e) {
            t.addNote({
              durationTicks: e.durationTicks,
              midi: e.midi,
              ticks: e.ticks,
              velocity: e.velocity,
            });
          });
        }),
        (e.prototype.toJSON = function () {
          for (var e = {}, t = 0; t < 127; t++)
            this.controlChanges.hasOwnProperty(t) &&
              (e[t] = this.controlChanges[t].map(function (e) {
                return e.toJSON();
              }));
          var n = {
            channel: this.channel,
            controlChanges: e,
            pitchBends: this.pitchBends.map(function (e) {
              return e.toJSON();
            }),
            instrument: this.instrument.toJSON(),
            name: this.name,
            notes: this.notes.map(function (e) {
              return e.toJSON();
            }),
          };
          return (
            this.endOfTrackTicks !== void 0 && (n.endOfTrackTicks = this.endOfTrackTicks),
            n
          );
        }),
        e
      );
    })();
  }),
  b = a({ flatten: () => x });
function x(e) {
  var t = [];
  return (S(e, t), t);
}
function S(e, t) {
  for (var n = 0; n < e.length; n++) {
    var r = e[n];
    Array.isArray(r) ? S(r, t) : t.push(r);
  }
}
var C = i((e) => {
    var t =
      (e && e.__spreadArray) ||
      function (e, t, n) {
        if (n || arguments.length === 2)
          for (var r = 0, i = t.length, a; r < i; r++)
            (a || !(r in t)) &&
              ((a ||= Array.prototype.slice.call(t, 0, r)), (a[r] = t[r]));
        return e.concat(a || Array.prototype.slice.call(t));
      };
    (Object.defineProperty(e, '__esModule', { value: !0 }), (e.encode = void 0));
    var n = u(),
      r = f(),
      i = s(b);
    function a(e, t) {
      return [
        {
          absoluteTime: e.ticks,
          channel: t,
          deltaTime: 0,
          noteNumber: e.midi,
          type: `noteOn`,
          velocity: Math.floor(e.velocity * 127),
        },
        {
          absoluteTime: e.ticks + e.durationTicks,
          channel: t,
          deltaTime: 0,
          noteNumber: e.midi,
          type: `noteOff`,
          velocity: Math.floor(e.noteOffVelocity * 127),
        },
      ];
    }
    function o(e) {
      return (0, i.flatten)(
        e.notes.map(function (t) {
          return a(t, e.channel);
        }),
      );
    }
    function c(e, t) {
      return {
        absoluteTime: e.ticks,
        channel: t,
        controllerType: e.number,
        deltaTime: 0,
        type: `controller`,
        value: Math.floor(e.value * 127),
      };
    }
    function l(e) {
      for (var t = [], n = 0; n < 127; n++)
        e.controlChanges.hasOwnProperty(n) &&
          e.controlChanges[n].forEach(function (n) {
            t.push(c(n, e.channel));
          });
      return t;
    }
    function d(e, t) {
      return {
        absoluteTime: e.ticks,
        channel: t,
        deltaTime: 0,
        type: `pitchBend`,
        value: e.value,
      };
    }
    function p(e) {
      var t = [];
      return (
        e.pitchBends.forEach(function (n) {
          t.push(d(n, e.channel));
        }),
        t
      );
    }
    function m(e) {
      return {
        absoluteTime: 0,
        channel: e.channel,
        deltaTime: 0,
        programNumber: e.instrument.number,
        type: `programChange`,
      };
    }
    function h(e) {
      return { absoluteTime: 0, deltaTime: 0, meta: !0, text: e, type: `trackName` };
    }
    function g(e) {
      return {
        absoluteTime: e.ticks,
        deltaTime: 0,
        meta: !0,
        microsecondsPerBeat: Math.floor(6e7 / e.bpm),
        type: `setTempo`,
      };
    }
    function _(e) {
      return {
        absoluteTime: e.ticks,
        deltaTime: 0,
        denominator: e.timeSignature[1],
        meta: !0,
        metronome: 24,
        numerator: e.timeSignature[0],
        thirtyseconds: 8,
        type: `timeSignature`,
      };
    }
    function v(e) {
      var t = r.keySignatureKeys.indexOf(e.key);
      return {
        absoluteTime: e.ticks,
        deltaTime: 0,
        key: t + 7,
        meta: !0,
        scale: e.scale === `major` ? 0 : 1,
        type: `keySignature`,
      };
    }
    function y(e) {
      return {
        absoluteTime: e.ticks,
        deltaTime: 0,
        meta: !0,
        text: e.text,
        type: e.type,
      };
    }
    function x(e) {
      var r = {
        header: { format: 1, numTracks: e.tracks.length + 1, ticksPerBeat: e.header.ppq },
        tracks: t(
          [
            t(
              t(
                t(
                  t(
                    [
                      {
                        absoluteTime: 0,
                        deltaTime: 0,
                        meta: !0,
                        text: e.header.name,
                        type: `trackName`,
                      },
                    ],
                    e.header.keySignatures.map(function (e) {
                      return v(e);
                    }),
                    !0,
                  ),
                  e.header.meta.map(function (e) {
                    return y(e);
                  }),
                  !0,
                ),
                e.header.tempos.map(function (e) {
                  return g(e);
                }),
                !0,
              ),
              e.header.timeSignatures.map(function (e) {
                return _(e);
              }),
              !0,
            ),
          ],
          e.tracks.map(function (e) {
            return t(t(t([h(e.name), m(e)], o(e), !0), l(e), !0), p(e), !0);
          }),
          !0,
        ),
      };
      return (
        (r.tracks = r.tracks.map(function (e) {
          e = e.sort(function (e, t) {
            return e.absoluteTime - t.absoluteTime;
          });
          var t = 0;
          return (
            e.forEach(function (e) {
              ((e.deltaTime = e.absoluteTime - t),
                (t = e.absoluteTime),
                delete e.absoluteTime);
            }),
            e.push({ deltaTime: 0, meta: !0, type: `endOfTrack` }),
            e
          );
        })),
        new Uint8Array((0, n.writeMidi)(r))
      );
    }
    e.encode = x;
  }),
  w = i((e) => {
    var t =
        (e && e.__awaiter) ||
        function (e, t, n, r) {
          function i(e) {
            return e instanceof n
              ? e
              : new n(function (t) {
                  t(e);
                });
          }
          return new (n ||= Promise)(function (n, a) {
            function o(e) {
              try {
                c(r.next(e));
              } catch (e) {
                a(e);
              }
            }
            function s(e) {
              try {
                c(r.throw(e));
              } catch (e) {
                a(e);
              }
            }
            function c(e) {
              e.done ? n(e.value) : i(e.value).then(o, s);
            }
            c((r = r.apply(e, t || [])).next());
          });
        },
      n =
        (e && e.__generator) ||
        function (e, t) {
          var n = {
              label: 0,
              sent: function () {
                if (a[0] & 1) throw a[1];
                return a[1];
              },
              trys: [],
              ops: [],
            },
            r,
            i,
            a,
            o;
          return (
            (o = { next: s(0), throw: s(1), return: s(2) }),
            typeof Symbol == `function` &&
              (o[Symbol.iterator] = function () {
                return this;
              }),
            o
          );
          function s(e) {
            return function (t) {
              return c([e, t]);
            };
          }
          function c(o) {
            if (r) throw TypeError(`Generator is already executing.`);
            for (; n;)
              try {
                if (
                  ((r = 1),
                  i &&
                    (a =
                      o[0] & 2
                        ? i.return
                        : o[0]
                          ? i.throw || ((a = i.return) && a.call(i), 0)
                          : i.next) &&
                    !(a = a.call(i, o[1])).done)
                )
                  return a;
                switch (((i = 0), a && (o = [o[0] & 2, a.value]), o[0])) {
                  case 0:
                  case 1:
                    a = o;
                    break;
                  case 4:
                    return (n.label++, { value: o[1], done: !1 });
                  case 5:
                    (n.label++, (i = o[1]), (o = [0]));
                    continue;
                  case 7:
                    ((o = n.ops.pop()), n.trys.pop());
                    continue;
                  default:
                    if (
                      ((a = n.trys), !(a = a.length > 0 && a[a.length - 1])) &&
                      (o[0] === 6 || o[0] === 2)
                    ) {
                      n = 0;
                      continue;
                    }
                    if (o[0] === 3 && (!a || (o[1] > a[0] && o[1] < a[3]))) {
                      n.label = o[1];
                      break;
                    }
                    if (o[0] === 6 && n.label < a[1]) {
                      ((n.label = a[1]), (a = o));
                      break;
                    }
                    if (a && n.label < a[2]) {
                      ((n.label = a[2]), n.ops.push(o));
                      break;
                    }
                    (a[2] && n.ops.pop(), n.trys.pop());
                    continue;
                }
                o = t.call(e, n);
              } catch (e) {
                ((o = [6, e]), (i = 0));
              } finally {
                r = a = 0;
              }
            if (o[0] & 5) throw o[1];
            return { value: o[0] ? o[1] : void 0, done: !0 };
          }
        };
    (Object.defineProperty(e, '__esModule', { value: !0 }),
      (e.Header = e.Track = e.Midi = void 0));
    var r = u(),
      i = f(),
      a = y(),
      o = C();
    e.Midi = (function () {
      function e(e) {
        var t = this,
          n = null;
        if (e) {
          var o = e instanceof ArrayBuffer ? new Uint8Array(e) : e;
          ((n = (0, r.parseMidi)(o)),
            n.tracks.forEach(function (e) {
              var t = 0;
              e.forEach(function (e) {
                ((t += e.deltaTime), (e.absoluteTime = t));
              });
            }),
            (n.tracks = l(n.tracks)));
        }
        ((this.header = new i.Header(n)),
          (this.tracks = []),
          e &&
            ((this.tracks = n.tracks.map(function (e) {
              return new a.Track(e, t.header);
            })),
            n.header.format === 1 &&
              this.tracks[0].duration === 0 &&
              this.tracks.shift()));
      }
      return (
        (e.fromUrl = function (r) {
          return t(this, void 0, void 0, function () {
            var t, i;
            return n(this, function (n) {
              switch (n.label) {
                case 0:
                  return [4, fetch(r)];
                case 1:
                  return ((t = n.sent()), t.ok ? [4, t.arrayBuffer()] : [3, 3]);
                case 2:
                  return ((i = n.sent()), [2, new e(i)]);
                case 3:
                  throw Error(`Could not load '${r}'`);
              }
            });
          });
        }),
        Object.defineProperty(e.prototype, 'name', {
          get: function () {
            return this.header.name;
          },
          set: function (e) {
            this.header.name = e;
          },
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(e.prototype, 'duration', {
          get: function () {
            var e = this.tracks.map(function (e) {
              return e.duration;
            });
            return Math.max.apply(Math, e);
          },
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(e.prototype, 'durationTicks', {
          get: function () {
            var e = this.tracks.map(function (e) {
              return e.durationTicks;
            });
            return Math.max.apply(Math, e);
          },
          enumerable: !1,
          configurable: !0,
        }),
        (e.prototype.addTrack = function () {
          var e = new a.Track(void 0, this.header);
          return (this.tracks.push(e), e);
        }),
        (e.prototype.toArray = function () {
          return (0, o.encode)(this);
        }),
        (e.prototype.toJSON = function () {
          return {
            header: this.header.toJSON(),
            tracks: this.tracks.map(function (e) {
              return e.toJSON();
            }),
          };
        }),
        (e.prototype.fromJSON = function (e) {
          var t = this;
          ((this.header = new i.Header()),
            this.header.fromJSON(e.header),
            (this.tracks = e.tracks.map(function (e) {
              var n = new a.Track(void 0, t.header);
              return (n.fromJSON(e), n);
            })));
        }),
        (e.prototype.clone = function () {
          var t = new e();
          return (t.fromJSON(this.toJSON()), t);
        }),
        e
      );
    })();
    var s = y();
    Object.defineProperty(e, 'Track', {
      enumerable: !0,
      get: function () {
        return s.Track;
      },
    });
    var c = f();
    Object.defineProperty(e, 'Header', {
      enumerable: !0,
      get: function () {
        return c.Header;
      },
    });
    function l(e) {
      for (var t = [], n = 0; n < e.length; n++)
        for (
          var r = t.length, i = new Map(), a = Array(16).fill(0), o = 0, s = e[n];
          o < s.length;
          o++
        ) {
          var c = s[o],
            l = r,
            u = c.channel;
          if (u !== void 0) {
            c.type === `programChange` && (a[u] = c.programNumber);
            var d = `${a[u]} ${u}`;
            i.has(d) ? (l = i.get(d)) : ((l = r + i.size), i.set(d, l));
          }
          (t[l] || t.push([]), t[l].push(c));
        }
      return t;
    }
  })(),
  T = `15.1.22`,
  E = i((e, t) => {
    function n(e) {
      if (Array.isArray(e)) return e;
    }
    ((t.exports = n), (t.exports.__esModule = !0), (t.exports.default = t.exports));
  }),
  D = i((e, t) => {
    function n(e, t) {
      var n =
        e == null ? null : (typeof Symbol < `u` && e[Symbol.iterator]) || e[`@@iterator`];
      if (n != null) {
        var r,
          i,
          a,
          o,
          s = [],
          c = !0,
          l = !1;
        try {
          if (((a = (n = n.call(e)).next), t === 0)) {
            if (Object(n) !== n) return;
            c = !1;
          } else
            for (
              ;
              !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t);
              c = !0
            );
        } catch (e) {
          ((l = !0), (i = e));
        } finally {
          try {
            if (!c && n.return != null && ((o = n.return()), Object(o) !== o)) return;
          } finally {
            if (l) throw i;
          }
        }
        return s;
      }
    }
    ((t.exports = n), (t.exports.__esModule = !0), (t.exports.default = t.exports));
  }),
  O = i((e, t) => {
    function n(e, t) {
      (t == null || t > e.length) && (t = e.length);
      for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
      return r;
    }
    ((t.exports = n), (t.exports.__esModule = !0), (t.exports.default = t.exports));
  }),
  k = i((e, t) => {
    var n = O();
    function r(e, t) {
      if (e) {
        if (typeof e == `string`) return n(e, t);
        var r = {}.toString.call(e).slice(8, -1);
        return (
          r === `Object` && e.constructor && (r = e.constructor.name),
          r === `Map` || r === `Set`
            ? Array.from(e)
            : r === `Arguments` || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
              ? n(e, t)
              : void 0
        );
      }
    }
    ((t.exports = r), (t.exports.__esModule = !0), (t.exports.default = t.exports));
  }),
  ee = i((e, t) => {
    function n() {
      throw TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
    }
    ((t.exports = n), (t.exports.__esModule = !0), (t.exports.default = t.exports));
  }),
  te = i((e, t) => {
    var n = E(),
      r = D(),
      i = k(),
      a = ee();
    function o(e, t) {
      return n(e) || r(e, t) || i(e, t) || a();
    }
    ((t.exports = o), (t.exports.__esModule = !0), (t.exports.default = t.exports));
  }),
  ne = i((e, t) => {
    function n(e, t) {
      if (!(e instanceof t)) throw TypeError(`Cannot call a class as a function`);
    }
    ((t.exports = n), (t.exports.__esModule = !0), (t.exports.default = t.exports));
  }),
  re = i((e, t) => {
    function n(e) {
      '@babel/helpers - typeof';
      return (
        (t.exports = n =
          typeof Symbol == `function` && typeof Symbol.iterator == `symbol`
            ? function (e) {
                return typeof e;
              }
            : function (e) {
                return e &&
                  typeof Symbol == `function` &&
                  e.constructor === Symbol &&
                  e !== Symbol.prototype
                  ? `symbol`
                  : typeof e;
              }),
        (t.exports.__esModule = !0),
        (t.exports.default = t.exports),
        n(e)
      );
    }
    ((t.exports = n), (t.exports.__esModule = !0), (t.exports.default = t.exports));
  }),
  ie = i((e, t) => {
    var n = re().default;
    function r(e, t) {
      if (n(e) != `object` || !e) return e;
      var r = e[Symbol.toPrimitive];
      if (r !== void 0) {
        var i = r.call(e, t || `default`);
        if (n(i) != `object`) return i;
        throw TypeError(`@@toPrimitive must return a primitive value.`);
      }
      return (t === `string` ? String : Number)(e);
    }
    ((t.exports = r), (t.exports.__esModule = !0), (t.exports.default = t.exports));
  }),
  ae = i((e, t) => {
    var n = re().default,
      r = ie();
    function i(e) {
      var t = r(e, `string`);
      return n(t) == `symbol` ? t : t + ``;
    }
    ((t.exports = i), (t.exports.__esModule = !0), (t.exports.default = t.exports));
  }),
  oe = i((e, t) => {
    var n = ae();
    function r(e, t) {
      for (var r = 0; r < t.length; r++) {
        var i = t[r];
        ((i.enumerable = i.enumerable || !1),
          (i.configurable = !0),
          `value` in i && (i.writable = !0),
          Object.defineProperty(e, n(i.key), i));
      }
    }
    function i(e, t, n) {
      return (
        t && r(e.prototype, t),
        n && r(e, n),
        Object.defineProperty(e, 'prototype', { writable: !1 }),
        e
      );
    }
    ((t.exports = i), (t.exports.__esModule = !0), (t.exports.default = t.exports));
  }),
  A = i((e, t) => {
    (function (n, r) {
      typeof e == `object` && t !== void 0
        ? r(e, te(), ne(), oe())
        : typeof define == `function` && define.amd
          ? define(
              [
                `exports`,
                `@babel/runtime/helpers/slicedToArray`,
                `@babel/runtime/helpers/classCallCheck`,
                `@babel/runtime/helpers/createClass`,
              ],
              r,
            )
          : ((n = typeof globalThis < `u` ? globalThis : n || self),
            r(
              (n.automationEvents = {}),
              n._slicedToArray,
              n._classCallCheck,
              n._createClass,
            ));
    })(e, function (e, t, n, r) {
      var i = function (e, t, n) {
          return { endTime: t, insertTime: n, type: `exponentialRampToValue`, value: e };
        },
        a = function (e, t, n) {
          return { endTime: t, insertTime: n, type: `linearRampToValue`, value: e };
        },
        o = function (e, t) {
          return { startTime: t, type: `setValue`, value: e };
        },
        s = function (e, t, n) {
          return { duration: n, startTime: t, type: `setValueCurve`, values: e };
        },
        c = function (e, t, n) {
          var r = n.startTime,
            i = n.target,
            a = n.timeConstant;
          return i + (t - i) * Math.exp((r - e) / a);
        },
        l = function (e) {
          return e.type === `exponentialRampToValue`;
        },
        u = function (e) {
          return e.type === `linearRampToValue`;
        },
        d = function (e) {
          return l(e) || u(e);
        },
        f = function (e) {
          return e.type === `setValue`;
        },
        p = function (e) {
          return e.type === `setValueCurve`;
        },
        m = function (e, t, n, r) {
          var i = e[t];
          return i === void 0
            ? r
            : d(i) || f(i)
              ? i.value
              : p(i)
                ? i.values[i.values.length - 1]
                : c(n, m(e, t - 1, i.startTime, r), i);
        },
        h = function (e, t, n, r, i) {
          return n === void 0
            ? [r.insertTime, i]
            : d(n)
              ? [n.endTime, n.value]
              : f(n)
                ? [n.startTime, n.value]
                : p(n)
                  ? [n.startTime + n.duration, n.values[n.values.length - 1]]
                  : [n.startTime, m(e, t - 1, n.startTime, i)];
        },
        g = function (e) {
          return e.type === `cancelAndHold`;
        },
        _ = function (e) {
          return e.type === `cancelScheduledValues`;
        },
        v = function (e) {
          return g(e) || _(e) ? e.cancelTime : l(e) || u(e) ? e.endTime : e.startTime;
        },
        y = function (e, t, n, r) {
          var i = r.endTime,
            a = r.value;
          return n === a
            ? a
            : (0 < n && 0 < a) || (n < 0 && a < 0)
              ? n * (a / n) ** +((e - t) / (i - t))
              : e < i
                ? n
                : a;
        },
        b = function (e, t, n, r) {
          var i = r.endTime,
            a = r.value;
          return n + ((e - t) / (i - t)) * (a - n);
        },
        x = function (e, t) {
          var n = Math.floor(t);
          if (n === t) return e[n];
          var r = Math.ceil(t);
          return (1 - (t - n)) * e[n] + (1 - (r - t)) * e[r];
        },
        S = function (e, t) {
          var n = t.duration,
            r = t.startTime,
            i = t.values;
          return x(i, ((e - r) / n) * (i.length - 1));
        },
        C = function (e, t, n) {
          for (
            var r = e.length,
              i = Math.max(1, Math.floor((n / t) * r)) + 1,
              a = e instanceof Float32Array ? new Float32Array(i) : e.slice(0, i),
              o = 0;
            o < i;
            o += 1
          )
            a[o] = x(e, (((o / (i - 1)) * n) / t) * (r - 1));
          return a;
        },
        w = function (e) {
          return e.type === `setTarget`;
        };
      ((e.AutomationEventList = (function () {
        function e(t) {
          (n(this, e),
            (this._automationEvents = []),
            (this._currenTime = 0),
            (this._defaultValue = t));
        }
        return r(e, [
          {
            key: Symbol.iterator,
            value: function () {
              return this._automationEvents[Symbol.iterator]();
            },
          },
          {
            key: `add`,
            value: function (e) {
              var t = v(e);
              if (g(e) || _(e)) {
                var n = this._automationEvents.findIndex(function (n) {
                    return _(e) && p(n) ? n.startTime + n.duration >= t : v(n) >= t;
                  }),
                  r = this._automationEvents[n];
                if (
                  (n !== -1 &&
                    (this._automationEvents = this._automationEvents.slice(0, n)),
                  g(e))
                ) {
                  var c = this._automationEvents[this._automationEvents.length - 1];
                  if (r !== void 0 && d(r)) {
                    if (c !== void 0 && w(c))
                      throw Error(`The internal list is malformed.`);
                    var f =
                        c === void 0
                          ? r.insertTime
                          : p(c)
                            ? c.startTime + c.duration
                            : v(c),
                      m =
                        c === void 0
                          ? this._defaultValue
                          : p(c)
                            ? c.values[c.values.length - 1]
                            : c.value,
                      h = l(r) ? y(t, f, m, r) : b(t, f, m, r),
                      x = l(r) ? i(h, t, this._currenTime) : a(h, t, this._currenTime);
                    this._automationEvents.push(x);
                  }
                  if (
                    (c !== void 0 &&
                      w(c) &&
                      this._automationEvents.push(o(this.getValue(t), t)),
                    c !== void 0 && p(c) && c.startTime + c.duration > t)
                  ) {
                    var S = t - c.startTime;
                    this._automationEvents[this._automationEvents.length - 1] = s(
                      C(c.values, c.duration, S),
                      c.startTime,
                      S,
                    );
                  }
                }
              } else {
                var T = this._automationEvents.findIndex(function (e) {
                    return v(e) > t;
                  }),
                  E =
                    T === -1
                      ? this._automationEvents[this._automationEvents.length - 1]
                      : this._automationEvents[T - 1];
                if (E !== void 0 && p(E) && v(E) + E.duration > t) return !1;
                var D = l(e)
                  ? i(e.value, e.endTime, this._currenTime)
                  : u(e)
                    ? a(e.value, t, this._currenTime)
                    : e;
                if (T === -1) this._automationEvents.push(D);
                else {
                  if (p(e) && t + e.duration > v(this._automationEvents[T])) return !1;
                  this._automationEvents.splice(T, 0, D);
                }
              }
              return !0;
            },
          },
          {
            key: `flush`,
            value: function (e) {
              var t = this._automationEvents.findIndex(function (t) {
                return v(t) > e;
              });
              if (t > 1) {
                var n = this._automationEvents.slice(t - 1),
                  r = n[0];
                (w(r) &&
                  n.unshift(
                    o(
                      m(this._automationEvents, t - 2, r.startTime, this._defaultValue),
                      r.startTime,
                    ),
                  ),
                  (this._automationEvents = n));
              }
            },
          },
          {
            key: `getValue`,
            value: function (e) {
              if (this._automationEvents.length === 0) return this._defaultValue;
              var n = this._automationEvents.findIndex(function (t) {
                  return v(t) > e;
                }),
                r = this._automationEvents[n],
                i = (n === -1 ? this._automationEvents.length : n) - 1,
                a = this._automationEvents[i];
              if (a !== void 0 && w(a) && (r === void 0 || !d(r) || r.insertTime > e))
                return c(
                  e,
                  m(this._automationEvents, i - 1, a.startTime, this._defaultValue),
                  a,
                );
              if (a !== void 0 && f(a) && (r === void 0 || !d(r))) return a.value;
              if (
                a !== void 0 &&
                p(a) &&
                (r === void 0 || !d(r) || a.startTime + a.duration > e)
              )
                return e < a.startTime + a.duration
                  ? S(e, a)
                  : a.values[a.values.length - 1];
              if (a !== void 0 && d(a) && (r === void 0 || !d(r))) return a.value;
              if (r !== void 0 && l(r)) {
                var o = t(h(this._automationEvents, i, a, r, this._defaultValue), 2),
                  s = o[0],
                  g = o[1];
                return y(e, s, g, r);
              }
              if (r !== void 0 && u(r)) {
                var _ = t(h(this._automationEvents, i, a, r, this._defaultValue), 2),
                  x = _[0],
                  C = _[1];
                return b(e, x, C, r);
              }
              return this._defaultValue;
            },
          },
        ]);
      })()),
        (e.createCancelAndHoldAutomationEvent = function (e) {
          return { cancelTime: e, type: `cancelAndHold` };
        }),
        (e.createCancelScheduledValuesAutomationEvent = function (e) {
          return { cancelTime: e, type: `cancelScheduledValues` };
        }),
        (e.createExponentialRampToValueAutomationEvent = function (e, t) {
          return { endTime: t, type: `exponentialRampToValue`, value: e };
        }),
        (e.createLinearRampToValueAutomationEvent = function (e, t) {
          return { endTime: t, type: `linearRampToValue`, value: e };
        }),
        (e.createSetTargetAutomationEvent = function (e, t, n) {
          return { startTime: t, target: e, timeConstant: n, type: `setTarget` };
        }),
        (e.createSetValueAutomationEvent = o),
        (e.createSetValueCurveAutomationEvent = s));
    });
  })(),
  se = () => new DOMException(``, `AbortError`),
  ce =
    (e) =>
    (t, n, [r, i, a], o) => {
      e(t[i], [n, r, a], (e) => e[0] === n && e[1] === r, o);
    },
  le = (e) => (t, n, r) => {
    let i = [];
    for (let e = 0; e < r.numberOfInputs; e += 1) i.push(new Set());
    e.set(t, {
      activeInputs: i,
      outputs: new Set(),
      passiveInputs: new WeakMap(),
      renderer: n,
    });
  },
  j = (e) => (t, n) => {
    e.set(t, { activeInputs: new Set(), passiveInputs: new WeakMap(), renderer: n });
  },
  ue = new WeakSet(),
  de = new WeakMap(),
  fe = new WeakMap(),
  pe = new WeakMap(),
  me = new WeakMap(),
  he = new WeakMap(),
  ge = new WeakMap(),
  _e = new WeakMap(),
  ve = new WeakMap(),
  ye = new WeakMap(),
  be = {
    construct() {
      return be;
    },
  },
  xe = (e) => {
    try {
      new new Proxy(e, be)();
    } catch {
      return !1;
    }
    return !0;
  },
  Se =
    /^import(?:(?:[\s]+[\w]+|(?:[\s]+[\w]+[\s]*,)?[\s]*\{[\s]*[\w]+(?:[\s]+as[\s]+[\w]+)?(?:[\s]*,[\s]*[\w]+(?:[\s]+as[\s]+[\w]+)?)*[\s]*}|(?:[\s]+[\w]+[\s]*,)?[\s]*\*[\s]+as[\s]+[\w]+)[\s]+from)?(?:[\s]*)("([^"\\]|\\.)+"|'([^'\\]|\\.)+')(?:[\s]*);?/,
  Ce = (e, t) => {
    let n = [],
      r = e.replace(/^[\s]+/, ``),
      i = r.match(Se);
    for (; i !== null;) {
      let e = i[1].slice(1, -1),
        a = i[0].replace(/([\s]+)?;?$/, ``).replace(e, new URL(e, t).toString());
      (n.push(a), (r = r.slice(i[0].length).replace(/^[\s]+/, ``)), (i = r.match(Se)));
    }
    return [n.join(`;`), r];
  },
  we = (e) => {
    if (e !== void 0 && !Array.isArray(e))
      throw TypeError(
        `The parameterDescriptors property of given value for processorCtor is not an array.`,
      );
  },
  Te = (e) => {
    if (!xe(e))
      throw TypeError(`The given value for processorCtor should be a constructor.`);
    if (e.prototype === null || typeof e.prototype != `object`)
      throw TypeError(`The given value for processorCtor should have a prototype.`);
  },
  Ee = (e, t, n, r, i, a, o, s, c, l, u, d, f) => {
    let p = 0;
    return (m, h, g = { credentials: `omit` }) => {
      let _ = u.get(m);
      if (_ !== void 0 && _.has(h)) return Promise.resolve();
      let v = l.get(m);
      if (v !== void 0) {
        let e = v.get(h);
        if (e !== void 0) return e;
      }
      let y = a(m),
        b =
          y.audioWorklet === void 0
            ? i(h)
                .then(([e, t]) => {
                  let [r, i] = Ce(e, t);
                  return n(`${r};((a,b)=>{(a[b]=a[b]||[]).push((AudioWorkletProcessor,global,registerProcessor,sampleRate,self,window)=>{${i}
})})(window,'_AWGS')`);
                })
                .then(() => {
                  let e = f._AWGS.pop();
                  if (e === void 0) throw SyntaxError();
                  r(y.currentTime, y.sampleRate, () =>
                    e(
                      class {},
                      void 0,
                      (e, n) => {
                        if (e.trim() === ``) throw t();
                        let r = ve.get(y);
                        if (r !== void 0) {
                          if (r.has(e)) throw t();
                          (Te(n), we(n.parameterDescriptors), r.set(e, n));
                        } else
                          (Te(n),
                            we(n.parameterDescriptors),
                            ve.set(y, new Map([[e, n]])));
                      },
                      y.sampleRate,
                      void 0,
                      void 0,
                    ),
                  );
                })
            : Promise.all([i(h), Promise.resolve(e(d, d))]).then(([[e, t], n]) => {
                let r = p + 1;
                p = r;
                let [i, a] = Ce(e, t),
                  l = `${i};((AudioWorkletProcessor,registerProcessor)=>{${a}
})(${n ? `AudioWorkletProcessor` : `class extends AudioWorkletProcessor {__b=new WeakSet();constructor(){super();(p=>p.postMessage=(q=>(m,t)=>q.call(p,m,t?t.filter(u=>!this.__b.has(u)):t))(p.postMessage))(this.port)}}`},(n,p)=>registerProcessor(n,class extends p{${n ? `` : `__c = (a) => a.forEach(e=>this.__b.add(e.buffer));`}process(i,o,p){${n ? `` : `i.forEach(this.__c);o.forEach(this.__c);this.__c(Object.values(p));`}return super.process(i.map(j=>j.some(k=>k.length===0)?[]:j),o,p)}}));registerProcessor('__sac${r}',class extends AudioWorkletProcessor{process(){return !1}})`,
                  u = new Blob([l], { type: `application/javascript; charset=utf-8` }),
                  d = URL.createObjectURL(u);
                return y.audioWorklet
                  .addModule(d, g)
                  .then(() => {
                    if (s(y)) return y;
                    let e = o(y);
                    return e.audioWorklet.addModule(d, g).then(() => e);
                  })
                  .then((e) => {
                    if (c === null) throw SyntaxError();
                    try {
                      new c(e, `__sac${r}`);
                    } catch {
                      throw SyntaxError();
                    }
                  })
                  .finally(() => URL.revokeObjectURL(d));
              });
      return (
        v === void 0 ? l.set(m, new Map([[h, b]])) : v.set(h, b),
        b
          .then(() => {
            let e = u.get(m);
            e === void 0 ? u.set(m, new Set([h])) : e.add(h);
          })
          .finally(() => {
            let e = l.get(m);
            e !== void 0 && e.delete(h);
          }),
        b
      );
    };
  },
  De = (e, t) => {
    let n = e.get(t);
    if (n === void 0) throw Error(`A value with the given key could not be found.`);
    return n;
  },
  Oe = (e, t) => {
    let n = Array.from(e).filter(t);
    if (n.length > 1) throw Error(`More than one element was found.`);
    if (n.length === 0) throw Error(`No element was found.`);
    let [r] = n;
    return (e.delete(r), r);
  },
  ke = (e, t, n, r) => {
    let i = De(e, t),
      a = Oe(i, (e) => e[0] === n && e[1] === r);
    return (i.size === 0 && e.delete(t), a);
  },
  Ae = (e) => De(ge, e),
  je = (e) => {
    if (ue.has(e)) throw Error(`The AudioNode is already stored.`);
    (ue.add(e), Ae(e).forEach((e) => e(!0)));
  },
  Me = (e) => `port` in e,
  Ne = (e) => {
    if (!ue.has(e)) throw Error(`The AudioNode is not stored.`);
    (ue.delete(e), Ae(e).forEach((e) => e(!1)));
  },
  Pe = (e, t) => {
    !Me(e) && t.every((e) => e.size === 0) && Ne(e);
  },
  Fe = (e, t, n, r, i, a, o, s, c, l, u, d, f) => {
    let p = new WeakMap();
    return (m, h, g, _, v) => {
      let { activeInputs: y, passiveInputs: b } = a(h),
        { outputs: x } = a(m),
        S = s(m),
        C = (a) => {
          let s = c(h),
            l = c(m);
          if (a) {
            let t = ke(b, m, g, _);
            (e(y, m, t, !1), !v && !d(m) && n(l, s, g, _), f(h) && je(h));
          } else {
            let e = r(y, m, g, _);
            (t(b, _, e, !1), !v && !d(m) && i(l, s, g, _));
            let n = o(h);
            if (n === 0) u(h) && Pe(h, y);
            else {
              let e = p.get(h);
              (e !== void 0 && clearTimeout(e),
                p.set(
                  h,
                  setTimeout(() => {
                    u(h) && Pe(h, y);
                  }, n * 1e3),
                ));
            }
          }
        };
      return l(x, [h, g, _], (e) => e[0] === h && e[1] === g && e[2] === _, !0)
        ? (S.add(C), u(m) ? e(y, m, [g, _, C], !0) : t(b, _, [m, g, C], !0), !0)
        : !1;
    };
  },
  Ie =
    (e) =>
    (t, n, [r, i, a], o) => {
      let s = t.get(r);
      s === void 0
        ? t.set(r, new Set([[i, n, a]]))
        : e(s, [i, n, a], (e) => e[0] === i && e[1] === n, o);
    },
  Le = (e) => (t, n) => {
    let r = e(t, {
      channelCount: 1,
      channelCountMode: `explicit`,
      channelInterpretation: `discrete`,
      gain: 0,
    });
    n.connect(r).connect(t.destination);
    let i = () => {
      (n.removeEventListener(`ended`, i), n.disconnect(r), r.disconnect());
    };
    n.addEventListener(`ended`, i);
  },
  Re = (e) => (t, n) => {
    e(t).add(n);
  },
  ze = {
    channelCount: 2,
    channelCountMode: `max`,
    channelInterpretation: `speakers`,
    fftSize: 2048,
    maxDecibels: -30,
    minDecibels: -100,
    smoothingTimeConstant: 0.8,
  },
  Be = (e, t, n, r, i, a) =>
    class extends e {
      constructor(e, n) {
        let o = i(e),
          s = r(o, { ...ze, ...n }),
          c = a(o) ? t() : null;
        (super(e, !1, s, c), (this._nativeAnalyserNode = s));
      }
      get fftSize() {
        return this._nativeAnalyserNode.fftSize;
      }
      set fftSize(e) {
        this._nativeAnalyserNode.fftSize = e;
      }
      get frequencyBinCount() {
        return this._nativeAnalyserNode.frequencyBinCount;
      }
      get maxDecibels() {
        return this._nativeAnalyserNode.maxDecibels;
      }
      set maxDecibels(e) {
        let t = this._nativeAnalyserNode.maxDecibels;
        if (
          ((this._nativeAnalyserNode.maxDecibels = e),
          !(e > this._nativeAnalyserNode.minDecibels))
        )
          throw ((this._nativeAnalyserNode.maxDecibels = t), n());
      }
      get minDecibels() {
        return this._nativeAnalyserNode.minDecibels;
      }
      set minDecibels(e) {
        let t = this._nativeAnalyserNode.minDecibels;
        if (
          ((this._nativeAnalyserNode.minDecibels = e),
          !(this._nativeAnalyserNode.maxDecibels > e))
        )
          throw ((this._nativeAnalyserNode.minDecibels = t), n());
      }
      get smoothingTimeConstant() {
        return this._nativeAnalyserNode.smoothingTimeConstant;
      }
      set smoothingTimeConstant(e) {
        this._nativeAnalyserNode.smoothingTimeConstant = e;
      }
      getByteFrequencyData(e) {
        this._nativeAnalyserNode.getByteFrequencyData(e);
      }
      getByteTimeDomainData(e) {
        this._nativeAnalyserNode.getByteTimeDomainData(e);
      }
      getFloatFrequencyData(e) {
        this._nativeAnalyserNode.getFloatFrequencyData(e);
      }
      getFloatTimeDomainData(e) {
        this._nativeAnalyserNode.getFloatTimeDomainData(e);
      }
    },
  M = (e, t) => e.context === t,
  Ve = (e, t, n) => () => {
    let r = new WeakMap(),
      i = async (i, a) => {
        let o = t(i);
        return (
          M(o, a) ||
            (o = e(a, {
              channelCount: o.channelCount,
              channelCountMode: o.channelCountMode,
              channelInterpretation: o.channelInterpretation,
              fftSize: o.fftSize,
              maxDecibels: o.maxDecibels,
              minDecibels: o.minDecibels,
              smoothingTimeConstant: o.smoothingTimeConstant,
            })),
          r.set(a, o),
          await n(i, a, o),
          o
        );
      };
    return {
      render(e, t) {
        let n = r.get(t);
        return n === void 0 ? i(e, t) : Promise.resolve(n);
      },
    };
  },
  He = (e) => {
    try {
      e.copyToChannel(new Float32Array(1), 0, -1);
    } catch {
      return !1;
    }
    return !0;
  },
  Ue = () => new DOMException(``, `IndexSizeError`),
  We = (e) => {
    e.getChannelData = ((t) => (n) => {
      try {
        return t.call(e, n);
      } catch (e) {
        throw e.code === 12 ? Ue() : e;
      }
    })(e.getChannelData);
  },
  Ge = { numberOfChannels: 1 },
  Ke = (e, t, n, r, i, a, o, s) => {
    let c = null;
    return class l {
      constructor(l) {
        if (i === null)
          throw Error(`Missing the native OfflineAudioContext constructor.`);
        let { length: u, numberOfChannels: d, sampleRate: f } = { ...Ge, ...l };
        c === null && (c = new i(1, 1, 44100));
        let p =
          r !== null && t(a, a)
            ? new r({ length: u, numberOfChannels: d, sampleRate: f })
            : c.createBuffer(d, u, f);
        if (p.numberOfChannels === 0) throw n();
        return (
          typeof p.copyFromChannel == `function`
            ? t(He, () => He(p)) || s(p)
            : (o(p), We(p)),
          e.add(p),
          p
        );
      }
      static [Symbol.hasInstance](t) {
        return (
          (typeof t == `object` && !!t && Object.getPrototypeOf(t) === l.prototype) ||
          e.has(t)
        );
      }
    };
  },
  qe = -34028234663852886e22,
  N = 34028234663852886e22,
  Je = (e) => ue.has(e),
  Ye = {
    buffer: null,
    channelCount: 2,
    channelCountMode: `max`,
    channelInterpretation: `speakers`,
    loop: !1,
    loopEnd: 0,
    loopStart: 0,
    playbackRate: 1,
  },
  Xe = (e, t, n, r, i, a, o, s) =>
    class extends e {
      constructor(e, r) {
        let s = a(e),
          c = { ...Ye, ...r },
          l = i(s, c),
          u = o(s),
          d = u ? t() : null;
        (super(e, !1, l, d),
          (this._audioBufferSourceNodeRenderer = d),
          (this._isBufferNullified = !1),
          (this._isBufferSet = c.buffer !== null),
          (this._nativeAudioBufferSourceNode = l),
          (this._onended = null),
          (this._playbackRate = n(this, u, l.playbackRate, N, qe)));
      }
      get buffer() {
        return this._isBufferNullified ? null : this._nativeAudioBufferSourceNode.buffer;
      }
      set buffer(e) {
        if (((this._nativeAudioBufferSourceNode.buffer = e), e !== null)) {
          if (this._isBufferSet) throw r();
          this._isBufferSet = !0;
        }
      }
      get loop() {
        return this._nativeAudioBufferSourceNode.loop;
      }
      set loop(e) {
        this._nativeAudioBufferSourceNode.loop = e;
      }
      get loopEnd() {
        return this._nativeAudioBufferSourceNode.loopEnd;
      }
      set loopEnd(e) {
        this._nativeAudioBufferSourceNode.loopEnd = e;
      }
      get loopStart() {
        return this._nativeAudioBufferSourceNode.loopStart;
      }
      set loopStart(e) {
        this._nativeAudioBufferSourceNode.loopStart = e;
      }
      get onended() {
        return this._onended;
      }
      set onended(e) {
        let t = typeof e == `function` ? s(this, e) : null;
        this._nativeAudioBufferSourceNode.onended = t;
        let n = this._nativeAudioBufferSourceNode.onended;
        this._onended = n !== null && n === t ? e : n;
      }
      get playbackRate() {
        return this._playbackRate;
      }
      start(e = 0, t = 0, n) {
        if (
          (this._nativeAudioBufferSourceNode.start(e, t, n),
          this._audioBufferSourceNodeRenderer !== null &&
            (this._audioBufferSourceNodeRenderer.start =
              n === void 0 ? [e, t] : [e, t, n]),
          this.context.state !== `closed`)
        ) {
          je(this);
          let e = () => {
            (this._nativeAudioBufferSourceNode.removeEventListener(`ended`, e),
              Je(this) && Ne(this));
          };
          this._nativeAudioBufferSourceNode.addEventListener(`ended`, e);
        }
      }
      stop(e = 0) {
        (this._nativeAudioBufferSourceNode.stop(e),
          this._audioBufferSourceNodeRenderer !== null &&
            (this._audioBufferSourceNodeRenderer.stop = e));
      }
    },
  Ze = (e, t, n, r, i) => () => {
    let a = new WeakMap(),
      o = null,
      s = null,
      c = async (c, l) => {
        let u = n(c),
          d = M(u, l);
        return (
          d ||
            ((u = t(l, {
              buffer: u.buffer,
              channelCount: u.channelCount,
              channelCountMode: u.channelCountMode,
              channelInterpretation: u.channelInterpretation,
              loop: u.loop,
              loopEnd: u.loopEnd,
              loopStart: u.loopStart,
              playbackRate: u.playbackRate.value,
            })),
            o !== null && u.start(...o),
            s !== null && u.stop(s)),
          a.set(l, u),
          d
            ? await e(l, c.playbackRate, u.playbackRate)
            : await r(l, c.playbackRate, u.playbackRate),
          await i(c, l, u),
          u
        );
      };
    return {
      set start(e) {
        o = e;
      },
      set stop(e) {
        s = e;
      },
      render(e, t) {
        let n = a.get(t);
        return n === void 0 ? c(e, t) : Promise.resolve(n);
      },
    };
  },
  Qe = (e) => `playbackRate` in e,
  $e = (e) => `frequency` in e && `gain` in e,
  et = (e) => `offset` in e,
  tt = (e) => !(`frequency` in e) && `gain` in e,
  nt = (e) => `detune` in e && `frequency` in e && !(`gain` in e),
  rt = (e) => `pan` in e,
  P = (e) => De(de, e),
  it = (e) => De(pe, e),
  at = (e, t) => {
    let { activeInputs: n } = P(e);
    n.forEach((n) =>
      n.forEach(([n]) => {
        t.includes(e) || at(n, [...t, e]);
      }),
    );
    let r = Qe(e)
      ? [e.playbackRate]
      : Me(e)
        ? Array.from(e.parameters.values())
        : $e(e)
          ? [e.Q, e.detune, e.frequency, e.gain]
          : et(e)
            ? [e.offset]
            : tt(e)
              ? [e.gain]
              : nt(e)
                ? [e.detune, e.frequency]
                : rt(e)
                  ? [e.pan]
                  : [];
    for (let e of r) {
      let n = it(e);
      n !== void 0 && n.activeInputs.forEach(([e]) => at(e, t));
    }
    Je(e) && Ne(e);
  },
  ot = (e) => {
    at(e.destination, []);
  },
  st = (e) =>
    e === void 0 ||
    typeof e == `number` ||
    (typeof e == `string` &&
      (e === `balanced` || e === `interactive` || e === `playback`)),
  ct = (e, t, n, r, i, a, o, s, c) =>
    class extends e {
      constructor(e = {}) {
        if (c === null) throw Error(`Missing the native AudioContext constructor.`);
        let t;
        try {
          t = new c(e);
        } catch (e) {
          throw e.code === 12 && e.message === `sampleRate is not in range` ? n() : e;
        }
        if (t === null) throw r();
        if (!st(e.latencyHint))
          throw TypeError(
            `The provided value '${e.latencyHint}' is not a valid enum value of type AudioContextLatencyCategory.`,
          );
        if (e.sampleRate !== void 0 && t.sampleRate !== e.sampleRate) throw n();
        super(t, 2);
        let { latencyHint: i } = e,
          { sampleRate: a } = t;
        if (
          ((this._baseLatency =
            typeof t.baseLatency == `number`
              ? t.baseLatency
              : i === `balanced`
                ? 512 / a
                : i === `interactive` || i === void 0
                  ? 256 / a
                  : i === `playback`
                    ? 1024 / a
                    : (Math.max(2, Math.min(128, Math.round((i * a) / 128))) * 128) / a),
          (this._nativeAudioContext = t),
          c.name === `webkitAudioContext`
            ? ((this._nativeGainNode = t.createGain()),
              (this._nativeOscillatorNode = t.createOscillator()),
              (this._nativeGainNode.gain.value = 1e-37),
              this._nativeOscillatorNode
                .connect(this._nativeGainNode)
                .connect(t.destination),
              this._nativeOscillatorNode.start())
            : ((this._nativeGainNode = null), (this._nativeOscillatorNode = null)),
          (this._state = null),
          t.state === `running`)
        ) {
          this._state = `suspended`;
          let e = () => {
            (this._state === `suspended` && (this._state = null),
              t.removeEventListener(`statechange`, e));
          };
          t.addEventListener(`statechange`, e);
        }
      }
      get baseLatency() {
        return this._baseLatency;
      }
      get state() {
        return this._state === null ? this._nativeAudioContext.state : this._state;
      }
      close() {
        return this.state === `closed`
          ? this._nativeAudioContext.close().then(() => {
              throw t();
            })
          : (this._state === `suspended` && (this._state = null),
            this._nativeAudioContext.close().then(() => {
              (this._nativeGainNode !== null &&
                this._nativeOscillatorNode !== null &&
                (this._nativeOscillatorNode.stop(),
                this._nativeGainNode.disconnect(),
                this._nativeOscillatorNode.disconnect()),
                ot(this));
            }));
      }
      createMediaElementSource(e) {
        return new i(this, { mediaElement: e });
      }
      createMediaStreamDestination() {
        return new a(this);
      }
      createMediaStreamSource(e) {
        return new o(this, { mediaStream: e });
      }
      createMediaStreamTrackSource(e) {
        return new s(this, { mediaStreamTrack: e });
      }
      resume() {
        return this._state === `suspended`
          ? new Promise((e, t) => {
              let n = () => {
                (this._nativeAudioContext.removeEventListener(`statechange`, n),
                  this._nativeAudioContext.state === `running`
                    ? e()
                    : this.resume().then(e, t));
              };
              this._nativeAudioContext.addEventListener(`statechange`, n);
            })
          : this._nativeAudioContext.resume().catch((e) => {
              throw e === void 0 || e.code === 15 ? t() : e;
            });
      }
      suspend() {
        return this._nativeAudioContext.suspend().catch((e) => {
          throw e === void 0 ? t() : e;
        });
      }
    },
  lt = (e, t, n, r, i, a, o, s) =>
    class extends e {
      constructor(e, n) {
        let r = a(e),
          c = o(r),
          l = i(r, n, c),
          u = c ? t(s) : null;
        (super(e, !1, l, u),
          (this._isNodeOfNativeOfflineAudioContext = c),
          (this._nativeAudioDestinationNode = l));
      }
      get channelCount() {
        return this._nativeAudioDestinationNode.channelCount;
      }
      set channelCount(e) {
        if (this._isNodeOfNativeOfflineAudioContext) throw r();
        if (e > this._nativeAudioDestinationNode.maxChannelCount) throw n();
        this._nativeAudioDestinationNode.channelCount = e;
      }
      get channelCountMode() {
        return this._nativeAudioDestinationNode.channelCountMode;
      }
      set channelCountMode(e) {
        if (this._isNodeOfNativeOfflineAudioContext) throw r();
        this._nativeAudioDestinationNode.channelCountMode = e;
      }
      get maxChannelCount() {
        return this._nativeAudioDestinationNode.maxChannelCount;
      }
    },
  ut = (e) => {
    let t = new WeakMap(),
      n = async (n, r) => {
        let i = r.destination;
        return (t.set(r, i), await e(n, r, i), i);
      };
    return {
      render(e, r) {
        let i = t.get(r);
        return i === void 0 ? n(e, r) : Promise.resolve(i);
      },
    };
  },
  dt = (e, t, n, r, i, a, o, s) => (c, l) => {
    let u = l.listener,
      {
        forwardX: d,
        forwardY: f,
        forwardZ: p,
        positionX: m,
        positionY: h,
        positionZ: g,
        upX: _,
        upY: v,
        upZ: y,
      } = u.forwardX === void 0
        ? (() => {
            let d = new Float32Array(1),
              f = t(l, {
                channelCount: 1,
                channelCountMode: `explicit`,
                channelInterpretation: `speakers`,
                numberOfInputs: 9,
              }),
              p = o(l),
              m = !1,
              h = [0, 0, -1, 0, 1, 0],
              g = [0, 0, 0],
              _ = () => {
                if (m) return;
                m = !0;
                let e = r(l, 256, 9, 0);
                ((e.onaudioprocess = ({ inputBuffer: e }) => {
                  let t = [
                    a(e, d, 0),
                    a(e, d, 1),
                    a(e, d, 2),
                    a(e, d, 3),
                    a(e, d, 4),
                    a(e, d, 5),
                  ];
                  t.some((e, t) => e !== h[t]) && (u.setOrientation(...t), (h = t));
                  let n = [a(e, d, 6), a(e, d, 7), a(e, d, 8)];
                  n.some((e, t) => e !== g[t]) && (u.setPosition(...n), (g = n));
                }),
                  f.connect(e));
              },
              v = (e) => (t) => {
                t !== h[e] && ((h[e] = t), u.setOrientation(...h));
              },
              y = (e) => (t) => {
                t !== g[e] && ((g[e] = t), u.setPosition(...g));
              },
              b = (t, r, a) => {
                let o = n(l, {
                  channelCount: 1,
                  channelCountMode: `explicit`,
                  channelInterpretation: `discrete`,
                  offset: r,
                });
                (o.connect(f, 0, t),
                  o.start(),
                  Object.defineProperty(o.offset, 'defaultValue', {
                    get() {
                      return r;
                    },
                  }));
                let u = e({ context: c }, p, o.offset, N, qe);
                return (
                  s(
                    u,
                    `value`,
                    (e) => () => e.call(u),
                    (e) => (t) => {
                      try {
                        e.call(u, t);
                      } catch (e) {
                        if (e.code !== 9) throw e;
                      }
                      (_(), p && a(t));
                    },
                  ),
                  (u.cancelAndHoldAtTime = ((e) =>
                    p
                      ? () => {
                          throw i();
                        }
                      : (...t) => {
                          let n = e.apply(u, t);
                          return (_(), n);
                        })(u.cancelAndHoldAtTime)),
                  (u.cancelScheduledValues = ((e) =>
                    p
                      ? () => {
                          throw i();
                        }
                      : (...t) => {
                          let n = e.apply(u, t);
                          return (_(), n);
                        })(u.cancelScheduledValues)),
                  (u.exponentialRampToValueAtTime = ((e) =>
                    p
                      ? () => {
                          throw i();
                        }
                      : (...t) => {
                          let n = e.apply(u, t);
                          return (_(), n);
                        })(u.exponentialRampToValueAtTime)),
                  (u.linearRampToValueAtTime = ((e) =>
                    p
                      ? () => {
                          throw i();
                        }
                      : (...t) => {
                          let n = e.apply(u, t);
                          return (_(), n);
                        })(u.linearRampToValueAtTime)),
                  (u.setTargetAtTime = ((e) =>
                    p
                      ? () => {
                          throw i();
                        }
                      : (...t) => {
                          let n = e.apply(u, t);
                          return (_(), n);
                        })(u.setTargetAtTime)),
                  (u.setValueAtTime = ((e) =>
                    p
                      ? () => {
                          throw i();
                        }
                      : (...t) => {
                          let n = e.apply(u, t);
                          return (_(), n);
                        })(u.setValueAtTime)),
                  (u.setValueCurveAtTime = ((e) =>
                    p
                      ? () => {
                          throw i();
                        }
                      : (...t) => {
                          let n = e.apply(u, t);
                          return (_(), n);
                        })(u.setValueCurveAtTime)),
                  u
                );
              };
            return {
              forwardX: b(0, 0, v(0)),
              forwardY: b(1, 0, v(1)),
              forwardZ: b(2, -1, v(2)),
              positionX: b(6, 0, y(0)),
              positionY: b(7, 0, y(1)),
              positionZ: b(8, 0, y(2)),
              upX: b(3, 0, v(3)),
              upY: b(4, 1, v(4)),
              upZ: b(5, 0, v(5)),
            };
          })()
        : u;
    return {
      get forwardX() {
        return d;
      },
      get forwardY() {
        return f;
      },
      get forwardZ() {
        return p;
      },
      get positionX() {
        return m;
      },
      get positionY() {
        return h;
      },
      get positionZ() {
        return g;
      },
      get upX() {
        return _;
      },
      get upY() {
        return v;
      },
      get upZ() {
        return y;
      },
    };
  },
  ft = (e) => `context` in e,
  pt = (e) => ft(e[0]),
  mt = (e, t, n, r) => {
    for (let t of e)
      if (n(t)) {
        if (r) return !1;
        throw Error(`The set contains at least one similar element.`);
      }
    return (e.add(t), !0);
  },
  ht = (e, t, [n, r], i) => {
    mt(e, [t, n, r], (e) => e[0] === t && e[1] === n, i);
  },
  gt = (e, [t, n, r], i) => {
    let a = e.get(t);
    a === void 0 ? e.set(t, new Set([[n, r]])) : mt(a, [n, r], (e) => e[0] === n, i);
  },
  _t = (e) => `inputs` in e,
  vt = (e, t, n, r) => {
    if (_t(t)) {
      let i = t.inputs[r];
      return (e.connect(i, n, 0), [i, n, 0]);
    }
    return (e.connect(t, n, r), [t, n, r]);
  },
  yt = (e, t, n) => {
    for (let r of e) if (r[0] === t && r[1] === n) return (e.delete(r), r);
    return null;
  },
  bt = (e, t, n) => Oe(e, (e) => e[0] === t && e[1] === n),
  xt = (e, t) => {
    if (!Ae(e).delete(t)) throw Error(`Missing the expected event listener.`);
  },
  St = (e, t, n) => {
    let r = De(e, t),
      i = Oe(r, (e) => e[0] === n);
    return (r.size === 0 && e.delete(t), i);
  },
  Ct = (e, t, n, r) => {
    _t(t) ? e.disconnect(t.inputs[r], n, 0) : e.disconnect(t, n, r);
  },
  F = (e) => De(fe, e),
  wt = (e) => De(me, e),
  Tt = (e) => _e.has(e),
  Et = (e) => !ue.has(e),
  Dt = (e, t) =>
    new Promise((n) => {
      if (t !== null) n(!0);
      else {
        let t = e.createScriptProcessor(256, 1, 1),
          r = e.createGain(),
          i = e.createBuffer(1, 2, 44100),
          a = i.getChannelData(0);
        ((a[0] = 1), (a[1] = 1));
        let o = e.createBufferSource();
        ((o.buffer = i),
          (o.loop = !0),
          o.connect(t).connect(e.destination),
          o.connect(r),
          o.disconnect(r),
          (t.onaudioprocess = (r) => {
            let i = r.inputBuffer.getChannelData(0);
            (Array.prototype.some.call(i, (e) => e === 1) ? n(!0) : n(!1),
              o.stop(),
              (t.onaudioprocess = null),
              o.disconnect(t),
              t.disconnect(e.destination));
          }),
          o.start());
      }
    }),
  Ot = (e, t) => {
    let n = new Map();
    for (let t of e)
      for (let e of t) {
        let t = n.get(e);
        n.set(e, t === void 0 ? 1 : t + 1);
      }
    n.forEach((e, n) => t(n, e));
  },
  kt = (e) => `context` in e,
  At = (e) => {
    let t = new Map();
    ((e.connect = (
      (e) =>
      (n, r = 0, i = 0) => {
        let a = kt(n) ? e(n, r, i) : e(n, r),
          o = t.get(n);
        return (
          o === void 0
            ? t.set(n, [{ input: i, output: r }])
            : o.every((e) => e.input !== i || e.output !== r) &&
              o.push({ input: i, output: r }),
          a
        );
      }
    )(e.connect.bind(e))),
      (e.disconnect = ((n) => (r, i, a) => {
        if ((n.apply(e), r === void 0)) t.clear();
        else if (typeof r == `number`)
          for (let [e, n] of t) {
            let i = n.filter((e) => e.output !== r);
            i.length === 0 ? t.delete(e) : t.set(e, i);
          }
        else if (t.has(r))
          if (i === void 0) t.delete(r);
          else {
            let e = t.get(r);
            if (e !== void 0) {
              let n = e.filter((e) => e.output !== i && (e.input !== a || a === void 0));
              n.length === 0 ? t.delete(r) : t.set(r, n);
            }
          }
        for (let [n, r] of t)
          r.forEach((t) => {
            kt(n) ? e.connect(n, t.output, t.input) : e.connect(n, t.output);
          });
      })(e.disconnect)));
  },
  jt = (e, t, n, r) => {
    let { activeInputs: i, passiveInputs: a } = it(t),
      { outputs: o } = P(e),
      s = Ae(e),
      c = (o) => {
        let s = F(e),
          c = wt(t);
        if (o) {
          let t = St(a, e, n);
          (ht(i, e, t, !1), !r && !Tt(e) && s.connect(c, n));
        } else {
          let t = bt(i, e, n);
          (gt(a, t, !1), !r && !Tt(e) && s.disconnect(c, n));
        }
      };
    return mt(o, [t, n], (e) => e[0] === t && e[1] === n, !0)
      ? (s.add(c), Je(e) ? ht(i, e, [n, c], !0) : gt(a, [e, n, c], !0), !0)
      : !1;
  },
  Mt = (e, t, n, r) => {
    let { activeInputs: i, passiveInputs: a } = P(t),
      o = yt(i[r], e, n);
    return o === null ? [ke(a, e, n, r)[2], !1] : [o[2], !0];
  },
  Nt = (e, t, n) => {
    let { activeInputs: r, passiveInputs: i } = it(t),
      a = yt(r, e, n);
    return a === null ? [St(i, e, n)[1], !1] : [a[2], !0];
  },
  Pt = (e, t, n, r, i) => {
    let [a, o] = Mt(e, n, r, i);
    if ((a !== null && (xt(e, a), o && !t && !Tt(e) && Ct(F(e), F(n), r, i)), Je(n))) {
      let { activeInputs: e } = P(n);
      Pe(n, e);
    }
  },
  Ft = (e, t, n, r) => {
    let [i, a] = Nt(e, n, r);
    i !== null && (xt(e, i), a && !t && !Tt(e) && F(e).disconnect(wt(n), r));
  },
  It = (e, t) => {
    let n = P(e),
      r = [];
    for (let i of n.outputs) (pt(i) ? Pt(e, t, ...i) : Ft(e, t, ...i), r.push(i[0]));
    return (n.outputs.clear(), r);
  },
  Lt = (e, t, n) => {
    let r = P(e),
      i = [];
    for (let a of r.outputs)
      a[1] === n &&
        (pt(a) ? Pt(e, t, ...a) : Ft(e, t, ...a), i.push(a[0]), r.outputs.delete(a));
    return i;
  },
  Rt = (e, t, n, r, i) => {
    let a = P(e);
    return Array.from(a.outputs)
      .filter(
        (e) => e[0] === n && (r === void 0 || e[1] === r) && (i === void 0 || e[2] === i),
      )
      .map((n) => (pt(n) ? Pt(e, t, ...n) : Ft(e, t, ...n), a.outputs.delete(n), n[0]));
  },
  zt = (e, t, n, r, i, a, o, s, c, l, u, d, f, p, m, h) =>
    class extends l {
      constructor(t, r, i, a) {
        (super(i), (this._context = t), (this._nativeAudioNode = i));
        let o = u(t);
        (d(o) && !0 !== n(Dt, () => Dt(o, h)) && At(i),
          fe.set(this, i),
          ge.set(this, new Set()),
          t.state !== `closed` && r && je(this),
          e(this, a, i));
      }
      get channelCount() {
        return this._nativeAudioNode.channelCount;
      }
      set channelCount(e) {
        this._nativeAudioNode.channelCount = e;
      }
      get channelCountMode() {
        return this._nativeAudioNode.channelCountMode;
      }
      set channelCountMode(e) {
        this._nativeAudioNode.channelCountMode = e;
      }
      get channelInterpretation() {
        return this._nativeAudioNode.channelInterpretation;
      }
      set channelInterpretation(e) {
        this._nativeAudioNode.channelInterpretation = e;
      }
      get context() {
        return this._context;
      }
      get numberOfInputs() {
        return this._nativeAudioNode.numberOfInputs;
      }
      get numberOfOutputs() {
        return this._nativeAudioNode.numberOfOutputs;
      }
      connect(e, n = 0, s = 0) {
        if (n < 0 || n >= this._nativeAudioNode.numberOfOutputs) throw i();
        let l = m(u(this._context));
        if (f(e) || p(e)) throw a();
        if (ft(e)) {
          let i = F(e);
          try {
            let t = vt(this._nativeAudioNode, i, n, s),
              r = Et(this);
            ((l || r) && this._nativeAudioNode.disconnect(...t),
              this.context.state !== `closed` && !r && Et(e) && je(e));
          } catch (e) {
            throw e.code === 12 ? a() : e;
          }
          return (t(this, e, n, s, l) && Ot(c([this], e), r(l)), e);
        }
        let d = wt(e);
        if (d.name === `playbackRate` && d.maxValue === 1024) throw o();
        try {
          (this._nativeAudioNode.connect(d, n),
            (l || Et(this)) && this._nativeAudioNode.disconnect(d, n));
        } catch (e) {
          throw e.code === 12 ? a() : e;
        }
        jt(this, e, n, l) && Ot(c([this], e), r(l));
      }
      disconnect(e, t, n) {
        let r,
          o = m(u(this._context));
        if (e === void 0) r = It(this, o);
        else if (typeof e == `number`) {
          if (e < 0 || e >= this.numberOfOutputs) throw i();
          r = Lt(this, o, e);
        } else {
          if (
            (t !== void 0 && (t < 0 || t >= this.numberOfOutputs)) ||
            (ft(e) && n !== void 0 && (n < 0 || n >= e.numberOfInputs))
          )
            throw i();
          if (((r = Rt(this, o, e, t, n)), r.length === 0)) throw a();
        }
        for (let e of r) Ot(c([this], e), s);
      }
    },
  Bt =
    (e, t, n, r, i, a, o, s, c, l, u, d, f) =>
    (p, m, h, g = null, _ = null) => {
      let v = h.value,
        y = new A.AutomationEventList(v),
        b = m ? r(y) : null,
        x = {
          get defaultValue() {
            return v;
          },
          get maxValue() {
            return g === null ? h.maxValue : g;
          },
          get minValue() {
            return _ === null ? h.minValue : _;
          },
          get value() {
            return h.value;
          },
          set value(e) {
            ((h.value = e), x.setValueAtTime(e, p.context.currentTime));
          },
          cancelAndHoldAtTime(e) {
            if (typeof h.cancelAndHoldAtTime == `function`)
              (b === null && y.flush(p.context.currentTime),
                y.add(i(e)),
                h.cancelAndHoldAtTime(e));
            else {
              let t = Array.from(y).pop();
              (b === null && y.flush(p.context.currentTime), y.add(i(e)));
              let n = Array.from(y).pop();
              (h.cancelScheduledValues(e),
                t !== n &&
                  n !== void 0 &&
                  (n.type === `exponentialRampToValue`
                    ? h.exponentialRampToValueAtTime(n.value, n.endTime)
                    : n.type === `linearRampToValue`
                      ? h.linearRampToValueAtTime(n.value, n.endTime)
                      : n.type === `setValue`
                        ? h.setValueAtTime(n.value, n.startTime)
                        : n.type === `setValueCurve` &&
                          h.setValueCurveAtTime(n.values, n.startTime, n.duration)));
            }
            return x;
          },
          cancelScheduledValues(e) {
            return (
              b === null && y.flush(p.context.currentTime),
              y.add(a(e)),
              h.cancelScheduledValues(e),
              x
            );
          },
          exponentialRampToValueAtTime(e, t) {
            if (e === 0 || !Number.isFinite(t) || t < 0) throw RangeError();
            let n = p.context.currentTime;
            return (
              b === null && y.flush(n),
              Array.from(y).length === 0 && (y.add(l(v, n)), h.setValueAtTime(v, n)),
              y.add(o(e, t)),
              h.exponentialRampToValueAtTime(e, t),
              x
            );
          },
          linearRampToValueAtTime(e, t) {
            let n = p.context.currentTime;
            return (
              b === null && y.flush(n),
              Array.from(y).length === 0 && (y.add(l(v, n)), h.setValueAtTime(v, n)),
              y.add(s(e, t)),
              h.linearRampToValueAtTime(e, t),
              x
            );
          },
          setTargetAtTime(e, t, n) {
            return (
              b === null && y.flush(p.context.currentTime),
              y.add(c(e, t, n)),
              h.setTargetAtTime(e, t, n),
              x
            );
          },
          setValueAtTime(e, t) {
            return (
              b === null && y.flush(p.context.currentTime),
              y.add(l(e, t)),
              h.setValueAtTime(e, t),
              x
            );
          },
          setValueCurveAtTime(e, t, n) {
            let r = e instanceof Float32Array ? e : new Float32Array(e);
            if (d !== null && d.name === `webkitAudioContext`) {
              let e = t + n,
                i = p.context.sampleRate,
                a = Math.ceil(t * i),
                o = Math.floor(e * i),
                s = o - a,
                c = new Float32Array(s);
              for (let e = 0; e < s; e += 1) {
                let o = ((r.length - 1) / n) * ((a + e) / i - t),
                  s = Math.floor(o),
                  l = Math.ceil(o);
                c[e] = s === l ? r[s] : (1 - (o - s)) * r[s] + (1 - (l - o)) * r[l];
              }
              (b === null && y.flush(p.context.currentTime),
                y.add(u(c, t, n)),
                h.setValueCurveAtTime(c, t, n));
              let l = o / i;
              (l < e && f(x, c[c.length - 1], l), f(x, r[r.length - 1], e));
            } else
              (b === null && y.flush(p.context.currentTime),
                y.add(u(r, t, n)),
                h.setValueCurveAtTime(r, t, n));
            return x;
          },
        };
      return (n.set(x, h), t.set(x, p), e(x, b), x);
    },
  Vt = (e) => ({
    replay(t) {
      for (let n of e)
        if (n.type === `exponentialRampToValue`) {
          let { endTime: e, value: r } = n;
          t.exponentialRampToValueAtTime(r, e);
        } else if (n.type === `linearRampToValue`) {
          let { endTime: e, value: r } = n;
          t.linearRampToValueAtTime(r, e);
        } else if (n.type === `setTarget`) {
          let { startTime: e, target: r, timeConstant: i } = n;
          t.setTargetAtTime(r, e, i);
        } else if (n.type === `setValue`) {
          let { startTime: e, value: r } = n;
          t.setValueAtTime(r, e);
        } else if (n.type === `setValueCurve`) {
          let { duration: e, startTime: r, values: i } = n;
          t.setValueCurveAtTime(i, r, e);
        } else throw Error(`Can't apply an unknown automation.`);
    },
  }),
  Ht = class {
    constructor(e) {
      this._map = new Map(e);
    }
    get size() {
      return this._map.size;
    }
    entries() {
      return this._map.entries();
    }
    forEach(e, t = null) {
      return this._map.forEach((n, r) => e.call(t, n, r, this));
    }
    get(e) {
      return this._map.get(e);
    }
    has(e) {
      return this._map.has(e);
    }
    keys() {
      return this._map.keys();
    }
    values() {
      return this._map.values();
    }
  },
  Ut = {
    channelCount: 2,
    channelCountMode: `explicit`,
    channelInterpretation: `speakers`,
    numberOfInputs: 1,
    numberOfOutputs: 1,
    parameterData: {},
    processorOptions: {},
  },
  Wt = (e, t, n, r, i, a, o, s, c, l, u, d, f, p) =>
    class extends t {
      constructor(t, p, m) {
        let h = s(t),
          g = c(h),
          _ = u({ ...Ut, ...m });
        f(_);
        let v = ve.get(h)?.get(p),
          y = i(
            g || h.state !== `closed` ? h : (o(h) ?? h),
            g ? null : t.baseLatency,
            l,
            p,
            v,
            _,
          ),
          b = g ? r(p, _, v) : null;
        super(t, !0, y, b);
        let x = [];
        (y.parameters.forEach((e, t) => {
          let r = n(this, g, e);
          x.push([t, r]);
        }),
          (this._nativeAudioWorkletNode = y),
          (this._onprocessorerror = null),
          (this._parameters = new Ht(x)),
          g && e(h, this));
        let { activeInputs: S } = a(this);
        d(y, S);
      }
      get onprocessorerror() {
        return this._onprocessorerror;
      }
      set onprocessorerror(e) {
        let t = typeof e == `function` ? p(this, e) : null;
        this._nativeAudioWorkletNode.onprocessorerror = t;
        let n = this._nativeAudioWorkletNode.onprocessorerror;
        this._onprocessorerror = n !== null && n === t ? e : n;
      }
      get parameters() {
        return this._parameters === null
          ? this._nativeAudioWorkletNode.parameters
          : this._parameters;
      }
      get port() {
        return this._nativeAudioWorkletNode.port;
      }
    };
function Gt(e, t, n, r, i) {
  if (typeof e.copyFromChannel == `function`)
    (t[n].byteLength === 0 && (t[n] = new Float32Array(128)),
      e.copyFromChannel(t[n], r, i));
  else {
    let a = e.getChannelData(r);
    if (t[n].byteLength === 0) t[n] = a.slice(i, i + 128);
    else {
      let e = new Float32Array(a.buffer, i * Float32Array.BYTES_PER_ELEMENT, 128);
      t[n].set(e);
    }
  }
}
var Kt = (e, t, n, r, i) => {
    typeof e.copyToChannel == `function`
      ? t[n].byteLength !== 0 && e.copyToChannel(t[n], r, i)
      : t[n].byteLength !== 0 && e.getChannelData(r).set(t[n], i);
  },
  qt = (e, t) => {
    let n = [];
    for (let r = 0; r < e; r += 1) {
      let e = [],
        i = typeof t == `number` ? t : t[r];
      for (let t = 0; t < i; t += 1) e.push(new Float32Array(128));
      n.push(e);
    }
    return n;
  },
  Jt = (e, t) => De(De(ye, e), F(t)),
  Yt = async (e, t, n, r, i, a, o) => {
    let s = t === null ? Math.ceil(e.context.length / 128) * 128 : t.length,
      c = r.channelCount * r.numberOfInputs,
      l = i.reduce((e, t) => e + t, 0),
      u = l === 0 ? null : n.createBuffer(l, s, n.sampleRate);
    if (a === void 0) throw Error(`Missing the processor constructor.`);
    let d = P(e),
      f = await Jt(n, e),
      p = qt(r.numberOfInputs, r.channelCount),
      m = qt(r.numberOfOutputs, i),
      h = Array.from(e.parameters.keys()).reduce(
        (e, t) => ({ ...e, [t]: new Float32Array(128) }),
        {},
      );
    for (let l = 0; l < s; l += 128) {
      if (r.numberOfInputs > 0 && t !== null)
        for (let e = 0; e < r.numberOfInputs; e += 1)
          for (let n = 0; n < r.channelCount; n += 1) Gt(t, p[e], n, n, l);
      a.parameterDescriptors !== void 0 &&
        t !== null &&
        a.parameterDescriptors.forEach(({ name: e }, n) => {
          Gt(t, h, e, c + n, l);
        });
      for (let e = 0; e < r.numberOfInputs; e += 1)
        for (let t = 0; t < i[e]; t += 1)
          m[e][t].byteLength === 0 && (m[e][t] = new Float32Array(128));
      try {
        let e = p.map((e, t) => (d.activeInputs[t].size === 0 ? [] : e)),
          t = o(l / n.sampleRate, n.sampleRate, () => f.process(e, m, h));
        if (u !== null)
          for (let e = 0, t = 0; e < r.numberOfOutputs; e += 1) {
            for (let n = 0; n < i[e]; n += 1) Kt(u, m[e], n, t + n, l);
            t += i[e];
          }
        if (!t) break;
      } catch (t) {
        e.dispatchEvent(
          new ErrorEvent(`processorerror`, {
            colno: t.colno,
            filename: t.filename,
            lineno: t.lineno,
            message: t.message,
          }),
        );
        break;
      }
    }
    return u;
  },
  Xt = (e, t, n, r, i, a, o, s, c, l, u, d, f, p, m, h) => (g, _, v) => {
    let y = new WeakMap(),
      b = null,
      x = async (s, x) => {
        let S = u(s),
          C = null,
          w = M(S, x),
          T = Array.isArray(_.outputChannelCount)
            ? _.outputChannelCount
            : Array.from(_.outputChannelCount);
        if (d === null) {
          let e = T.reduce((e, t) => e + t, 0),
            n = i(x, {
              channelCount: Math.max(1, e),
              channelCountMode: `explicit`,
              channelInterpretation: `discrete`,
              numberOfOutputs: Math.max(1, e),
            }),
            a = [];
          for (let e = 0; e < s.numberOfOutputs; e += 1)
            a.push(
              r(x, {
                channelCount: 1,
                channelCountMode: `explicit`,
                channelInterpretation: `speakers`,
                numberOfInputs: T[e],
              }),
            );
          let l = o(x, {
            channelCount: _.channelCount,
            channelCountMode: _.channelCountMode,
            channelInterpretation: _.channelInterpretation,
            gain: 1,
          });
          ((l.connect = t.bind(null, a)),
            (l.disconnect = c.bind(null, a)),
            (C = [n, a, l]));
        } else w || (S = new d(x, g));
        if ((y.set(x, C === null ? S : C[2]), C !== null)) {
          if (b === null) {
            if (v === void 0) throw Error(`Missing the processor constructor.`);
            if (f === null)
              throw Error(`Missing the native OfflineAudioContext constructor.`);
            let e = s.channelCount * s.numberOfInputs,
              t = v.parameterDescriptors === void 0 ? 0 : v.parameterDescriptors.length,
              n = e + t;
            b = Yt(
              s,
              n === 0
                ? null
                : await (async () => {
                    let c = new f(
                        n,
                        Math.ceil(s.context.length / 128) * 128,
                        x.sampleRate,
                      ),
                      l = [],
                      u = [];
                    for (let e = 0; e < _.numberOfInputs; e += 1)
                      (l.push(
                        o(c, {
                          channelCount: _.channelCount,
                          channelCountMode: _.channelCountMode,
                          channelInterpretation: _.channelInterpretation,
                          gain: 1,
                        }),
                      ),
                        u.push(
                          i(c, {
                            channelCount: _.channelCount,
                            channelCountMode: `explicit`,
                            channelInterpretation: `discrete`,
                            numberOfOutputs: _.channelCount,
                          }),
                        ));
                    let d = await Promise.all(
                        Array.from(s.parameters.values()).map(async (e) => {
                          let t = a(c, {
                            channelCount: 1,
                            channelCountMode: `explicit`,
                            channelInterpretation: `discrete`,
                            offset: e.value,
                          });
                          return (await p(c, e, t.offset), t);
                        }),
                      ),
                      g = r(c, {
                        channelCount: 1,
                        channelCountMode: `explicit`,
                        channelInterpretation: `speakers`,
                        numberOfInputs: Math.max(1, e + t),
                      });
                    for (let e = 0; e < _.numberOfInputs; e += 1) {
                      l[e].connect(u[e]);
                      for (let t = 0; t < _.channelCount; t += 1)
                        u[e].connect(g, t, e * _.channelCount + t);
                    }
                    for (let [t, n] of d.entries()) (n.connect(g, 0, e + t), n.start(0));
                    return (
                      g.connect(c.destination),
                      await Promise.all(l.map((e) => m(s, c, e))),
                      h(c)
                    );
                  })(),
              x,
              _,
              T,
              v,
              l,
            );
          }
          let e = await b,
            t = n(x, {
              buffer: null,
              channelCount: 2,
              channelCountMode: `max`,
              channelInterpretation: `speakers`,
              loop: !1,
              loopEnd: 0,
              loopStart: 0,
              playbackRate: 1,
            }),
            [c, u, d] = C;
          (e !== null && ((t.buffer = e), t.start(0)), t.connect(c));
          for (let e = 0, t = 0; e < s.numberOfOutputs; e += 1) {
            let n = u[e];
            for (let r = 0; r < T[e]; r += 1) c.connect(n, t + r, r);
            t += T[e];
          }
          return d;
        }
        if (w)
          for (let [t, n] of s.parameters.entries()) await e(x, n, S.parameters.get(t));
        else
          for (let [e, t] of s.parameters.entries()) await p(x, t, S.parameters.get(e));
        return (await m(s, x, S), S);
      };
    return {
      render(e, t) {
        s(t, e);
        let n = y.get(t);
        return n === void 0 ? x(e, t) : Promise.resolve(n);
      },
    };
  },
  Zt = (e, t, n, r, i, a, o, s, c, l, u, d, f, p, m, h, g, _, v, y) =>
    class extends m {
      constructor(t, n) {
        (super(t, n),
          (this._nativeContext = t),
          (this._audioWorklet =
            e === void 0 ? void 0 : { addModule: (t, n) => e(this, t, n) }));
      }
      get audioWorklet() {
        return this._audioWorklet;
      }
      createAnalyser() {
        return new t(this);
      }
      createBiquadFilter() {
        return new i(this);
      }
      createBuffer(e, t, r) {
        return new n({ length: t, numberOfChannels: e, sampleRate: r });
      }
      createBufferSource() {
        return new r(this);
      }
      createChannelMerger(e = 6) {
        return new a(this, { numberOfInputs: e });
      }
      createChannelSplitter(e = 6) {
        return new o(this, { numberOfOutputs: e });
      }
      createConstantSource() {
        return new s(this);
      }
      createConvolver() {
        return new c(this);
      }
      createDelay(e = 1) {
        return new u(this, { maxDelayTime: e });
      }
      createDynamicsCompressor() {
        return new d(this);
      }
      createGain() {
        return new f(this);
      }
      createIIRFilter(e, t) {
        return new p(this, { feedback: t, feedforward: e });
      }
      createOscillator() {
        return new h(this);
      }
      createPanner() {
        return new g(this);
      }
      createPeriodicWave(e, t, n = { disableNormalization: !1 }) {
        return new _(this, { ...n, imag: t, real: e });
      }
      createStereoPanner() {
        return new v(this);
      }
      createWaveShaper() {
        return new y(this);
      }
      decodeAudioData(e, t, n) {
        return l(this._nativeContext, e).then(
          (e) => (typeof t == `function` && t(e), e),
          (e) => {
            throw (typeof n == `function` && n(e), e);
          },
        );
      }
    },
  Qt = {
    Q: 1,
    channelCount: 2,
    channelCountMode: `max`,
    channelInterpretation: `speakers`,
    detune: 0,
    frequency: 350,
    gain: 0,
    type: `lowpass`,
  },
  $t = (e, t, n, r, i, a, o, s) =>
    class extends e {
      constructor(e, r) {
        let c = a(e),
          l = i(c, { ...Qt, ...r }),
          u = o(c),
          d = u ? n() : null;
        (super(e, !1, l, d),
          (this._Q = t(this, u, l.Q, N, qe)),
          (this._detune = t(
            this,
            u,
            l.detune,
            1200 * Math.log2(N),
            -1200 * Math.log2(N),
          )),
          (this._frequency = t(this, u, l.frequency, e.sampleRate / 2, 0)),
          (this._gain = t(this, u, l.gain, 40 * Math.log10(N), qe)),
          (this._nativeBiquadFilterNode = l),
          s(this, 1));
      }
      get detune() {
        return this._detune;
      }
      get frequency() {
        return this._frequency;
      }
      get gain() {
        return this._gain;
      }
      get Q() {
        return this._Q;
      }
      get type() {
        return this._nativeBiquadFilterNode.type;
      }
      set type(e) {
        this._nativeBiquadFilterNode.type = e;
      }
      getFrequencyResponse(e, t, n) {
        try {
          this._nativeBiquadFilterNode.getFrequencyResponse(e, t, n);
        } catch (e) {
          throw e.code === 11 ? r() : e;
        }
        if (e.length !== t.length || t.length !== n.length) throw r();
      }
    },
  en = (e, t, n, r, i) => () => {
    let a = new WeakMap(),
      o = async (o, s) => {
        let c = n(o),
          l = M(c, s);
        return (
          l ||
            (c = t(s, {
              Q: c.Q.value,
              channelCount: c.channelCount,
              channelCountMode: c.channelCountMode,
              channelInterpretation: c.channelInterpretation,
              detune: c.detune.value,
              frequency: c.frequency.value,
              gain: c.gain.value,
              type: c.type,
            })),
          a.set(s, c),
          l
            ? (await e(s, o.Q, c.Q),
              await e(s, o.detune, c.detune),
              await e(s, o.frequency, c.frequency),
              await e(s, o.gain, c.gain))
            : (await r(s, o.Q, c.Q),
              await r(s, o.detune, c.detune),
              await r(s, o.frequency, c.frequency),
              await r(s, o.gain, c.gain)),
          await i(o, s, c),
          c
        );
      };
    return {
      render(e, t) {
        let n = a.get(t);
        return n === void 0 ? o(e, t) : Promise.resolve(n);
      },
    };
  },
  tn = (e, t) => (n, r) => {
    let i = t.get(n);
    if (i !== void 0) return i;
    let a = e.get(n);
    if (a !== void 0) return a;
    try {
      let i = r();
      return i instanceof Promise
        ? (e.set(n, i), i.catch(() => !1).then((r) => (e.delete(n), t.set(n, r), r)))
        : (t.set(n, i), i);
    } catch {
      return (t.set(n, !1), !1);
    }
  },
  nn = {
    channelCount: 1,
    channelCountMode: `explicit`,
    channelInterpretation: `speakers`,
    numberOfInputs: 6,
  },
  rn = (e, t, n, r, i) =>
    class extends e {
      constructor(e, a) {
        let o = r(e),
          s = n(o, { ...nn, ...a }),
          c = i(o) ? t() : null;
        super(e, !1, s, c);
      }
    },
  an = (e, t, n) => () => {
    let r = new WeakMap(),
      i = async (i, a) => {
        let o = t(i);
        return (
          M(o, a) ||
            (o = e(a, {
              channelCount: o.channelCount,
              channelCountMode: o.channelCountMode,
              channelInterpretation: o.channelInterpretation,
              numberOfInputs: o.numberOfInputs,
            })),
          r.set(a, o),
          await n(i, a, o),
          o
        );
      };
    return {
      render(e, t) {
        let n = r.get(t);
        return n === void 0 ? i(e, t) : Promise.resolve(n);
      },
    };
  },
  on = {
    channelCount: 6,
    channelCountMode: `explicit`,
    channelInterpretation: `discrete`,
    numberOfOutputs: 6,
  },
  sn = (e, t, n, r, i, a) =>
    class extends e {
      constructor(e, o) {
        let s = r(e),
          c = n(s, a({ ...on, ...o })),
          l = i(s) ? t() : null;
        super(e, !1, c, l);
      }
    },
  cn = (e, t, n) => () => {
    let r = new WeakMap(),
      i = async (i, a) => {
        let o = t(i);
        return (
          M(o, a) ||
            (o = e(a, {
              channelCount: o.channelCount,
              channelCountMode: o.channelCountMode,
              channelInterpretation: o.channelInterpretation,
              numberOfOutputs: o.numberOfOutputs,
            })),
          r.set(a, o),
          await n(i, a, o),
          o
        );
      };
    return {
      render(e, t) {
        let n = r.get(t);
        return n === void 0 ? i(e, t) : Promise.resolve(n);
      },
    };
  },
  ln = (e) => (t, n, r) => e(n, t, r),
  un =
    (e) =>
    (t, n, r = 0, i = 0) => {
      let a = t[r];
      if (a === void 0) throw e();
      return kt(n) ? a.connect(n, 0, i) : a.connect(n, 0);
    },
  dn = (e) => (t, n) => {
    let r = e(t, {
      buffer: null,
      channelCount: 2,
      channelCountMode: `max`,
      channelInterpretation: `speakers`,
      loop: !1,
      loopEnd: 0,
      loopStart: 0,
      playbackRate: 1,
    });
    return (
      (r.buffer = t.createBuffer(1, 2, 44100)),
      (r.loop = !0),
      r.connect(n),
      r.start(),
      () => {
        (r.stop(), r.disconnect(n));
      }
    );
  },
  fn = {
    channelCount: 2,
    channelCountMode: `max`,
    channelInterpretation: `speakers`,
    offset: 1,
  },
  pn = (e, t, n, r, i, a, o) =>
    class extends e {
      constructor(e, o) {
        let s = i(e),
          c = r(s, { ...fn, ...o }),
          l = a(s),
          u = l ? n() : null;
        (super(e, !1, c, u),
          (this._constantSourceNodeRenderer = u),
          (this._nativeConstantSourceNode = c),
          (this._offset = t(this, l, c.offset, N, qe)),
          (this._onended = null));
      }
      get offset() {
        return this._offset;
      }
      get onended() {
        return this._onended;
      }
      set onended(e) {
        let t = typeof e == `function` ? o(this, e) : null;
        this._nativeConstantSourceNode.onended = t;
        let n = this._nativeConstantSourceNode.onended;
        this._onended = n !== null && n === t ? e : n;
      }
      start(e = 0) {
        if (
          (this._nativeConstantSourceNode.start(e),
          this._constantSourceNodeRenderer !== null &&
            (this._constantSourceNodeRenderer.start = e),
          this.context.state !== `closed`)
        ) {
          je(this);
          let e = () => {
            (this._nativeConstantSourceNode.removeEventListener(`ended`, e),
              Je(this) && Ne(this));
          };
          this._nativeConstantSourceNode.addEventListener(`ended`, e);
        }
      }
      stop(e = 0) {
        (this._nativeConstantSourceNode.stop(e),
          this._constantSourceNodeRenderer !== null &&
            (this._constantSourceNodeRenderer.stop = e));
      }
    },
  mn = (e, t, n, r, i) => () => {
    let a = new WeakMap(),
      o = null,
      s = null,
      c = async (c, l) => {
        let u = n(c),
          d = M(u, l);
        return (
          d ||
            ((u = t(l, {
              channelCount: u.channelCount,
              channelCountMode: u.channelCountMode,
              channelInterpretation: u.channelInterpretation,
              offset: u.offset.value,
            })),
            o !== null && u.start(o),
            s !== null && u.stop(s)),
          a.set(l, u),
          d ? await e(l, c.offset, u.offset) : await r(l, c.offset, u.offset),
          await i(c, l, u),
          u
        );
      };
    return {
      set start(e) {
        o = e;
      },
      set stop(e) {
        s = e;
      },
      render(e, t) {
        let n = a.get(t);
        return n === void 0 ? c(e, t) : Promise.resolve(n);
      },
    };
  },
  hn = (e) => (t) => ((e[0] = t), e[0]),
  gn = {
    buffer: null,
    channelCount: 2,
    channelCountMode: `clamped-max`,
    channelInterpretation: `speakers`,
    disableNormalization: !1,
  },
  _n = (e, t, n, r, i, a) =>
    class extends e {
      constructor(e, o) {
        let s = r(e),
          c = { ...gn, ...o },
          l = n(s, c),
          u = i(s) ? t() : null;
        (super(e, !1, l, u),
          (this._isBufferNullified = !1),
          (this._nativeConvolverNode = l),
          c.buffer !== null && a(this, c.buffer.duration));
      }
      get buffer() {
        return this._isBufferNullified ? null : this._nativeConvolverNode.buffer;
      }
      set buffer(e) {
        if (
          ((this._nativeConvolverNode.buffer = e),
          e === null && this._nativeConvolverNode.buffer !== null)
        ) {
          let e = this._nativeConvolverNode.context;
          ((this._nativeConvolverNode.buffer = e.createBuffer(1, 1, e.sampleRate)),
            (this._isBufferNullified = !0),
            a(this, 0));
        } else
          ((this._isBufferNullified = !1),
            a(
              this,
              this._nativeConvolverNode.buffer === null
                ? 0
                : this._nativeConvolverNode.buffer.duration,
            ));
      }
      get normalize() {
        return this._nativeConvolverNode.normalize;
      }
      set normalize(e) {
        this._nativeConvolverNode.normalize = e;
      }
    },
  vn = (e, t, n) => () => {
    let r = new WeakMap(),
      i = async (i, a) => {
        let o = t(i);
        return (
          M(o, a) ||
            (o = e(a, {
              buffer: o.buffer,
              channelCount: o.channelCount,
              channelCountMode: o.channelCountMode,
              channelInterpretation: o.channelInterpretation,
              disableNormalization: !o.normalize,
            })),
          r.set(a, o),
          _t(o) ? await n(i, a, o.inputs[0]) : await n(i, a, o),
          o
        );
      };
    return {
      render(e, t) {
        let n = r.get(t);
        return n === void 0 ? i(e, t) : Promise.resolve(n);
      },
    };
  },
  yn = (e, t) => (n, r, i) => {
    if (t === null) throw Error(`Missing the native OfflineAudioContext constructor.`);
    try {
      return new t(n, r, i);
    } catch (t) {
      throw t.name === `SyntaxError` ? e() : t;
    }
  },
  bn = () => new DOMException(``, `DataCloneError`),
  xn = (e) => {
    let { port1: t, port2: n } = new MessageChannel();
    return new Promise((r) => {
      let i = () => {
        ((n.onmessage = null), t.close(), n.close(), r());
      };
      n.onmessage = () => i();
      try {
        t.postMessage(e, [e]);
      } catch {
      } finally {
        i();
      }
    });
  },
  Sn = (e, t, n, r, i, a, o, s, c, l, u) => (d, f) => {
    let p = o(d) ? d : a(d);
    if (i.has(f)) {
      let e = n();
      return Promise.reject(e);
    }
    try {
      i.add(f);
    } catch {}
    return t(c, () => c(p))
      ? p
          .decodeAudioData(f)
          .then((n) => (xn(f).catch(() => {}), t(s, () => s(n)) || u(n), e.add(n), n))
      : new Promise((t, n) => {
          let i = async () => {
              try {
                await xn(f);
              } catch {}
            },
            a = (e) => {
              (n(e), i());
            };
          try {
            p.decodeAudioData(
              f,
              (n) => {
                (typeof n.copyFromChannel != `function` && (l(n), We(n)),
                  e.add(n),
                  i().then(() => t(n)));
              },
              (e) => {
                a(e === null ? r() : e);
              },
            );
          } catch (e) {
            a(e);
          }
        });
  },
  Cn = (e, t, n, r, i, a, o, s) => (c, l) => {
    let u = t.get(c);
    if (u === void 0) throw Error(`Missing the expected cycle count.`);
    let d = s(a(c.context));
    if (u === l) {
      if ((t.delete(c), !d && o(c))) {
        let t = r(c),
          { outputs: a } = n(c);
        for (let n of a)
          if (pt(n)) e(t, r(n[0]), n[1], n[2]);
          else {
            let e = i(n[0]);
            t.connect(e, n[1]);
          }
      }
    } else t.set(c, u - l);
  },
  wn = {
    channelCount: 2,
    channelCountMode: `max`,
    channelInterpretation: `speakers`,
    delayTime: 0,
    maxDelayTime: 1,
  },
  Tn = (e, t, n, r, i, a, o) =>
    class extends e {
      constructor(e, s) {
        let c = i(e),
          l = { ...wn, ...s },
          u = r(c, l),
          d = a(c),
          f = d ? n(l.maxDelayTime) : null;
        (super(e, !1, u, f),
          (this._delayTime = t(this, d, u.delayTime)),
          o(this, l.maxDelayTime));
      }
      get delayTime() {
        return this._delayTime;
      }
    },
  En = (e, t, n, r, i) => (a) => {
    let o = new WeakMap(),
      s = async (s, c) => {
        let l = n(s),
          u = M(l, c);
        return (
          u ||
            (l = t(c, {
              channelCount: l.channelCount,
              channelCountMode: l.channelCountMode,
              channelInterpretation: l.channelInterpretation,
              delayTime: l.delayTime.value,
              maxDelayTime: a,
            })),
          o.set(c, l),
          u ? await e(c, s.delayTime, l.delayTime) : await r(c, s.delayTime, l.delayTime),
          await i(s, c, l),
          l
        );
      };
    return {
      render(e, t) {
        let n = o.get(t);
        return n === void 0 ? s(e, t) : Promise.resolve(n);
      },
    };
  },
  Dn = (e) => (t, n, r, i) => e(t[i], (e) => e[0] === n && e[1] === r),
  On = (e) => (t, n) => {
    e(t).delete(n);
  },
  kn = (e) => `delayTime` in e,
  An = (e, t, n) =>
    function r(i, a) {
      let o = ft(a) ? a : n(e, a);
      if (kn(o)) return [];
      if (i[0] === o) return [i];
      if (i.includes(o)) return [];
      let { outputs: s } = t(o);
      return Array.from(s)
        .map((e) => r([...i, o], e[0]))
        .reduce((e, t) => e.concat(t), []);
    },
  jn = (e, t, n) => {
    let r = t[n];
    if (r === void 0) throw e();
    return r;
  },
  Mn =
    (e) =>
    (t, n = void 0, r = void 0, i = 0) =>
      n === void 0
        ? t.forEach((e) => e.disconnect())
        : typeof n == `number`
          ? jn(e, t, n).disconnect()
          : kt(n)
            ? r === void 0
              ? t.forEach((e) => e.disconnect(n))
              : i === void 0
                ? jn(e, t, r).disconnect(n, 0)
                : jn(e, t, r).disconnect(n, 0, i)
            : r === void 0
              ? t.forEach((e) => e.disconnect(n))
              : jn(e, t, r).disconnect(n, 0),
  Nn = {
    attack: 0.003,
    channelCount: 2,
    channelCountMode: `clamped-max`,
    channelInterpretation: `speakers`,
    knee: 30,
    ratio: 12,
    release: 0.25,
    threshold: -24,
  },
  Pn = (e, t, n, r, i, a, o, s) =>
    class extends e {
      constructor(e, i) {
        let c = a(e),
          l = r(c, { ...Nn, ...i }),
          u = o(c),
          d = u ? n() : null;
        (super(e, !1, l, d),
          (this._attack = t(this, u, l.attack)),
          (this._knee = t(this, u, l.knee)),
          (this._nativeDynamicsCompressorNode = l),
          (this._ratio = t(this, u, l.ratio)),
          (this._release = t(this, u, l.release)),
          (this._threshold = t(this, u, l.threshold)),
          s(this, 0.006));
      }
      get attack() {
        return this._attack;
      }
      get channelCount() {
        return this._nativeDynamicsCompressorNode.channelCount;
      }
      set channelCount(e) {
        let t = this._nativeDynamicsCompressorNode.channelCount;
        if (((this._nativeDynamicsCompressorNode.channelCount = e), e > 2))
          throw ((this._nativeDynamicsCompressorNode.channelCount = t), i());
      }
      get channelCountMode() {
        return this._nativeDynamicsCompressorNode.channelCountMode;
      }
      set channelCountMode(e) {
        let t = this._nativeDynamicsCompressorNode.channelCountMode;
        if (((this._nativeDynamicsCompressorNode.channelCountMode = e), e === `max`))
          throw ((this._nativeDynamicsCompressorNode.channelCountMode = t), i());
      }
      get knee() {
        return this._knee;
      }
      get ratio() {
        return this._ratio;
      }
      get reduction() {
        return typeof this._nativeDynamicsCompressorNode.reduction.value == `number`
          ? this._nativeDynamicsCompressorNode.reduction.value
          : this._nativeDynamicsCompressorNode.reduction;
      }
      get release() {
        return this._release;
      }
      get threshold() {
        return this._threshold;
      }
    },
  Fn = (e, t, n, r, i) => () => {
    let a = new WeakMap(),
      o = async (o, s) => {
        let c = n(o),
          l = M(c, s);
        return (
          l ||
            (c = t(s, {
              attack: c.attack.value,
              channelCount: c.channelCount,
              channelCountMode: c.channelCountMode,
              channelInterpretation: c.channelInterpretation,
              knee: c.knee.value,
              ratio: c.ratio.value,
              release: c.release.value,
              threshold: c.threshold.value,
            })),
          a.set(s, c),
          l
            ? (await e(s, o.attack, c.attack),
              await e(s, o.knee, c.knee),
              await e(s, o.ratio, c.ratio),
              await e(s, o.release, c.release),
              await e(s, o.threshold, c.threshold))
            : (await r(s, o.attack, c.attack),
              await r(s, o.knee, c.knee),
              await r(s, o.ratio, c.ratio),
              await r(s, o.release, c.release),
              await r(s, o.threshold, c.threshold)),
          await i(o, s, c),
          c
        );
      };
    return {
      render(e, t) {
        let n = a.get(t);
        return n === void 0 ? o(e, t) : Promise.resolve(n);
      },
    };
  },
  In = () => new DOMException(``, `EncodingError`),
  Ln = (e) => (t) =>
    new Promise((n, r) => {
      if (e === null) {
        r(SyntaxError());
        return;
      }
      let i = e.document.head;
      if (i === null) r(SyntaxError());
      else {
        let a = e.document.createElement(`script`),
          o = new Blob([t], { type: `application/javascript` }),
          s = URL.createObjectURL(o),
          c = e.onerror,
          l = () => {
            ((e.onerror = c), URL.revokeObjectURL(s));
          };
        ((e.onerror = (t, n, i, a, o) => {
          if (n === s || (n === e.location.href && i === 1 && a === 1))
            return (l(), r(o), !1);
          if (c !== null) return c(t, n, i, a, o);
        }),
          (a.onerror = () => {
            (l(), r(SyntaxError()));
          }),
          (a.onload = () => {
            (l(), n());
          }),
          (a.src = s),
          (a.type = `module`),
          i.appendChild(a));
      }
    }),
  Rn = (e) =>
    class {
      constructor(e) {
        ((this._nativeEventTarget = e), (this._listeners = new WeakMap()));
      }
      addEventListener(t, n, r) {
        if (n !== null) {
          let i = this._listeners.get(n);
          (i === void 0 &&
            ((i = e(this, n)), typeof n == `function` && this._listeners.set(n, i)),
            this._nativeEventTarget.addEventListener(t, i, r));
        }
      }
      dispatchEvent(e) {
        return this._nativeEventTarget.dispatchEvent(e);
      }
      removeEventListener(e, t, n) {
        let r = t === null ? void 0 : this._listeners.get(t);
        this._nativeEventTarget.removeEventListener(e, r === void 0 ? null : r, n);
      }
    },
  zn = (e) => (t, n, r) => {
    Object.defineProperties(e, {
      currentFrame: {
        configurable: !0,
        get() {
          return Math.round(t * n);
        },
      },
      currentTime: {
        configurable: !0,
        get() {
          return t;
        },
      },
    });
    try {
      return r();
    } finally {
      e !== null && (delete e.currentFrame, delete e.currentTime);
    }
  },
  Bn = (e) => async (t) => {
    try {
      let e = await fetch(t);
      if (e.ok) return [await e.text(), e.url];
    } catch {}
    throw e();
  },
  Vn = {
    channelCount: 2,
    channelCountMode: `max`,
    channelInterpretation: `speakers`,
    gain: 1,
  },
  Hn = (e, t, n, r, i, a) =>
    class extends e {
      constructor(e, o) {
        let s = i(e),
          c = r(s, { ...Vn, ...o }),
          l = a(s),
          u = l ? n() : null;
        (super(e, !1, c, u), (this._gain = t(this, l, c.gain, N, qe)));
      }
      get gain() {
        return this._gain;
      }
    },
  Un = (e, t, n, r, i) => () => {
    let a = new WeakMap(),
      o = async (o, s) => {
        let c = n(o),
          l = M(c, s);
        return (
          l ||
            (c = t(s, {
              channelCount: c.channelCount,
              channelCountMode: c.channelCountMode,
              channelInterpretation: c.channelInterpretation,
              gain: c.gain.value,
            })),
          a.set(s, c),
          l ? await e(s, o.gain, c.gain) : await r(s, o.gain, c.gain),
          await i(o, s, c),
          c
        );
      };
    return {
      render(e, t) {
        let n = a.get(t);
        return n === void 0 ? o(e, t) : Promise.resolve(n);
      },
    };
  },
  Wn = (e, t) => (n) => t(e, n),
  Gn = (e) => (t) => {
    let n = e(t);
    if (n.renderer === null)
      throw Error(`Missing the renderer of the given AudioNode in the audio graph.`);
    return n.renderer;
  },
  Kn = (e) => (t) => e.get(t) ?? 0,
  qn = (e) => (t) => {
    let n = e(t);
    if (n.renderer === null)
      throw Error(`Missing the renderer of the given AudioParam in the audio graph.`);
    return n.renderer;
  },
  Jn = (e) => (t) => e.get(t),
  I = () => new DOMException(``, `InvalidStateError`),
  Yn = (e) => (t) => {
    let n = e.get(t);
    if (n === void 0) throw I();
    return n;
  },
  Xn = (e, t) => (n) => {
    let r = e.get(n);
    if (r !== void 0) return r;
    if (t === null) throw Error(`Missing the native OfflineAudioContext constructor.`);
    return ((r = new t(1, 1, 44100)), e.set(n, r), r);
  },
  Zn = (e) => (t) => {
    let n = e.get(t);
    if (n === void 0) throw Error(`The context has no set of AudioWorkletNodes.`);
    return n;
  },
  Qn = () => new DOMException(``, `InvalidAccessError`),
  $n = (e) => {
    e.getFrequencyResponse = ((t) => (n, r, i) => {
      if (n.length !== r.length || r.length !== i.length) throw Qn();
      return t.call(e, n, r, i);
    })(e.getFrequencyResponse);
  },
  er = { channelCount: 2, channelCountMode: `max`, channelInterpretation: `speakers` },
  tr = (e, t, n, r, i, a) =>
    class extends e {
      constructor(e, o) {
        let s = r(e),
          c = i(s),
          l = { ...er, ...o },
          u = t(s, c ? null : e.baseLatency, l),
          d = c ? n(l.feedback, l.feedforward) : null;
        (super(e, !1, u, d), $n(u), (this._nativeIIRFilterNode = u), a(this, 1));
      }
      getFrequencyResponse(e, t, n) {
        return this._nativeIIRFilterNode.getFrequencyResponse(e, t, n);
      }
    },
  nr = (e, t, n, r, i, a, o, s, c, l, u) => {
    let d = l.length,
      f = s;
    for (let s = 0; s < d; s += 1) {
      let d = n[0] * l[s];
      for (let t = 1; t < i; t += 1) {
        let r = (f - t) & (c - 1);
        ((d += n[t] * a[r]), (d -= e[t] * o[r]));
      }
      for (let e = i; e < r; e += 1) d += n[e] * a[(f - e) & (c - 1)];
      for (let n = i; n < t; n += 1) d -= e[n] * o[(f - n) & (c - 1)];
      ((a[f] = l[s]), (o[f] = d), (f = (f + 1) & (c - 1)), (u[s] = d));
    }
    return f;
  },
  rr = (e, t, n, r) => {
    let i = n instanceof Float64Array ? n : new Float64Array(n),
      a = r instanceof Float64Array ? r : new Float64Array(r),
      o = i.length,
      s = a.length,
      c = Math.min(o, s);
    if (i[0] !== 1) {
      for (let e = 0; e < o; e += 1) a[e] /= i[0];
      for (let e = 1; e < s; e += 1) i[e] /= i[0];
    }
    let l = new Float32Array(32),
      u = new Float32Array(32),
      d = t.createBuffer(e.numberOfChannels, e.length, e.sampleRate),
      f = e.numberOfChannels;
    for (let t = 0; t < f; t += 1) {
      let n = e.getChannelData(t),
        r = d.getChannelData(t);
      (l.fill(0), u.fill(0), nr(i, o, a, s, c, l, u, 0, 32, n, r));
    }
    return d;
  },
  ir = (e, t, n, r, i) => (a, o) => {
    let s = new WeakMap(),
      c = null,
      l = async (l, u) => {
        let d = null,
          f = t(l),
          p = M(f, u);
        if (
          (u.createIIRFilter === void 0
            ? (d = e(u, {
                buffer: null,
                channelCount: 2,
                channelCountMode: `max`,
                channelInterpretation: `speakers`,
                loop: !1,
                loopEnd: 0,
                loopStart: 0,
                playbackRate: 1,
              }))
            : p || (f = u.createIIRFilter(o, a)),
          s.set(u, d === null ? f : d),
          d !== null)
        ) {
          if (c === null) {
            if (n === null)
              throw Error(`Missing the native OfflineAudioContext constructor.`);
            let e = new n(
              l.context.destination.channelCount,
              l.context.length,
              u.sampleRate,
            );
            c = (async () => (await r(l, e, e.destination), rr(await i(e), u, a, o)))();
          }
          let e = await c;
          return ((d.buffer = e), d.start(0), d);
        }
        return (await r(l, u, f), f);
      };
    return {
      render(e, t) {
        let n = s.get(t);
        return n === void 0 ? l(e, t) : Promise.resolve(n);
      },
    };
  },
  ar = (e, t, n, r, i, a) => (o) => (s, c) => {
    let l = e.get(s);
    if (l === void 0) {
      if (!o && a(s)) {
        let e = r(s),
          { outputs: a } = n(s);
        for (let n of a)
          if (pt(n)) t(e, r(n[0]), n[1], n[2]);
          else {
            let t = i(n[0]);
            e.disconnect(t, n[1]);
          }
      }
      e.set(s, c);
    } else e.set(s, l + c);
  },
  or = (e, t) => (n) => t(e.get(n)) || t(n),
  sr = (e, t) => (n) => e.has(n) || t(n),
  cr = (e, t) => (n) => e.has(n) || t(n),
  lr = (e, t) => (n) => t(e.get(n)) || t(n),
  ur = (e) => (t) => e !== null && t instanceof e,
  dr = (e) => (t) =>
    e !== null && typeof e.AudioNode == `function` && t instanceof e.AudioNode,
  fr = (e) => (t) =>
    e !== null && typeof e.AudioParam == `function` && t instanceof e.AudioParam,
  pr = (e, t) => (n) => e(n) || t(n),
  mr = (e) => (t) => e !== null && t instanceof e,
  hr = (e) => e !== null && e.isSecureContext,
  gr = (e, t, n, r) =>
    class extends e {
      constructor(e, i) {
        let a = n(e),
          o = t(a, i);
        if (r(a)) throw TypeError();
        (super(e, !0, o, null), (this._nativeMediaElementAudioSourceNode = o));
      }
      get mediaElement() {
        return this._nativeMediaElementAudioSourceNode.mediaElement;
      }
    },
  _r = {
    channelCount: 2,
    channelCountMode: `explicit`,
    channelInterpretation: `speakers`,
  },
  vr = (e, t, n, r) =>
    class extends e {
      constructor(e, i) {
        let a = n(e);
        if (r(a)) throw TypeError();
        let o = t(a, { ..._r, ...i });
        (super(e, !1, o, null), (this._nativeMediaStreamAudioDestinationNode = o));
      }
      get stream() {
        return this._nativeMediaStreamAudioDestinationNode.stream;
      }
    },
  yr = (e, t, n, r) =>
    class extends e {
      constructor(e, i) {
        let a = n(e),
          o = t(a, i);
        if (r(a)) throw TypeError();
        (super(e, !0, o, null), (this._nativeMediaStreamAudioSourceNode = o));
      }
      get mediaStream() {
        return this._nativeMediaStreamAudioSourceNode.mediaStream;
      }
    },
  br = (e, t, n) =>
    class extends e {
      constructor(e, r) {
        let i = t(n(e), r);
        super(e, !0, i, null);
      }
    },
  xr = (e, t, n, r, i, a) =>
    class extends n {
      constructor(n, a) {
        (super(n),
          (this._nativeContext = n),
          he.set(this, n),
          r(n) && i.set(n, new Set()),
          (this._destination = new e(this, a)),
          (this._listener = t(this, n)),
          (this._onstatechange = null));
      }
      get currentTime() {
        return this._nativeContext.currentTime;
      }
      get destination() {
        return this._destination;
      }
      get listener() {
        return this._listener;
      }
      get onstatechange() {
        return this._onstatechange;
      }
      set onstatechange(e) {
        let t = typeof e == `function` ? a(this, e) : null;
        this._nativeContext.onstatechange = t;
        let n = this._nativeContext.onstatechange;
        this._onstatechange = n !== null && n === t ? e : n;
      }
      get sampleRate() {
        return this._nativeContext.sampleRate;
      }
      get state() {
        return this._nativeContext.state;
      }
    },
  Sr = (e) => {
    let t = new Uint32Array([
      1179011410, 40, 1163280727, 544501094, 16, 131073, 44100, 176400, 1048580,
      1635017060, 4, 0,
    ]);
    try {
      let n = e.decodeAudioData(t.buffer, () => {});
      return n === void 0 ? !1 : (n.catch(() => {}), !0);
    } catch {}
    return !1;
  },
  Cr = (e, t) => (n, r, i) => {
    let a = new Set();
    return (
      (n.connect = (
        (i) =>
        (o, s = 0, c = 0) => {
          let l = a.size === 0;
          if (t(o))
            return (
              i.call(n, o, s, c),
              e(a, [o, s, c], (e) => e[0] === o && e[1] === s && e[2] === c, !0),
              l && r(),
              o
            );
          (i.call(n, o, s), e(a, [o, s], (e) => e[0] === o && e[1] === s, !0), l && r());
        }
      )(n.connect)),
      (n.disconnect = ((e) => (r, o, s) => {
        let c = a.size > 0;
        if (r === void 0) (e.apply(n), a.clear());
        else if (typeof r == `number`) {
          e.call(n, r);
          for (let e of a) e[1] === r && a.delete(e);
        } else {
          t(r) ? e.call(n, r, o, s) : e.call(n, r, o);
          for (let e of a)
            e[0] === r &&
              (o === void 0 || e[1] === o) &&
              (s === void 0 || e[2] === s) &&
              a.delete(e);
        }
        let l = a.size === 0;
        c && l && i();
      })(n.disconnect)),
      n
    );
  },
  L = (e, t, n) => {
    let r = t[n];
    r !== void 0 && r !== e[n] && (e[n] = r);
  },
  R = (e, t) => {
    (L(e, t, `channelCount`),
      L(e, t, `channelCountMode`),
      L(e, t, `channelInterpretation`));
  },
  wr = (e) => typeof e.getFloatTimeDomainData == `function`,
  Tr = (e) => {
    e.getFloatTimeDomainData = (t) => {
      let n = new Uint8Array(t.length);
      e.getByteTimeDomainData(n);
      let r = Math.max(n.length, e.fftSize);
      for (let e = 0; e < r; e += 1) t[e] = (n[e] - 128) * 0.0078125;
      return t;
    };
  },
  Er = (e, t) => (n, r) => {
    let i = n.createAnalyser();
    if ((R(i, r), !(r.maxDecibels > r.minDecibels))) throw t();
    return (
      L(i, r, `fftSize`),
      L(i, r, `maxDecibels`),
      L(i, r, `minDecibels`),
      L(i, r, `smoothingTimeConstant`),
      e(wr, () => wr(i)) || Tr(i),
      i
    );
  },
  Dr = (e) =>
    e === null ? null : e.hasOwnProperty(`AudioBuffer`) ? e.AudioBuffer : null,
  z = (e, t, n) => {
    let r = t[n];
    r !== void 0 && r !== e[n].value && (e[n].value = r);
  },
  Or = (e) => {
    e.start = ((t) => {
      let n = !1;
      return (r = 0, i = 0, a) => {
        if (n) throw I();
        (t.call(e, r, i, a), (n = !0));
      };
    })(e.start);
  },
  kr = (e) => {
    e.start = (
      (t) =>
      (n = 0, r = 0, i) => {
        if ((typeof i == `number` && i < 0) || r < 0 || n < 0)
          throw RangeError(`The parameters can't be negative.`);
        t.call(e, n, r, i);
      }
    )(e.start);
  },
  Ar = (e) => {
    e.stop = (
      (t) =>
      (n = 0) => {
        if (n < 0) throw RangeError(`The parameter can't be negative.`);
        t.call(e, n);
      }
    )(e.stop);
  },
  jr = (e, t, n, r, i, a, o, s, c, l, u) => (d, f) => {
    let p = d.createBufferSource();
    return (
      R(p, f),
      z(p, f, `playbackRate`),
      L(p, f, `buffer`),
      L(p, f, `loop`),
      L(p, f, `loopEnd`),
      L(p, f, `loopStart`),
      t(n, () => n(d)) || Or(p),
      t(r, () => r(d)) || c(p),
      t(i, () => i(d)) || l(p, d),
      t(a, () => a(d)) || kr(p),
      t(o, () => o(d)) || u(p, d),
      t(s, () => s(d)) || Ar(p),
      e(d, p),
      p
    );
  },
  Mr = (e) =>
    e === null
      ? null
      : e.hasOwnProperty(`AudioContext`)
        ? e.AudioContext
        : e.hasOwnProperty(`webkitAudioContext`)
          ? e.webkitAudioContext
          : null,
  Nr = (e, t) => (n, r, i) => {
    let a = n.destination;
    if (a.channelCount !== r)
      try {
        a.channelCount = r;
      } catch {}
    (i && a.channelCountMode !== `explicit` && (a.channelCountMode = `explicit`),
      a.maxChannelCount === 0 &&
        Object.defineProperty(a, 'maxChannelCount', { value: r }));
    let o = e(n, {
      channelCount: r,
      channelCountMode: a.channelCountMode,
      channelInterpretation: a.channelInterpretation,
      gain: 1,
    });
    return (
      t(
        o,
        `channelCount`,
        (e) => () => e.call(o),
        (e) => (t) => {
          e.call(o, t);
          try {
            a.channelCount = t;
          } catch (e) {
            if (t > a.maxChannelCount) throw e;
          }
        },
      ),
      t(
        o,
        `channelCountMode`,
        (e) => () => e.call(o),
        (e) => (t) => {
          (e.call(o, t), (a.channelCountMode = t));
        },
      ),
      t(
        o,
        `channelInterpretation`,
        (e) => () => e.call(o),
        (e) => (t) => {
          (e.call(o, t), (a.channelInterpretation = t));
        },
      ),
      Object.defineProperty(o, 'maxChannelCount', { get: () => a.maxChannelCount }),
      o.connect(a),
      o
    );
  },
  Pr = (e) =>
    e === null ? null : e.hasOwnProperty(`AudioWorkletNode`) ? e.AudioWorkletNode : null,
  Fr = (e) => {
    let { port1: t } = new MessageChannel();
    try {
      t.postMessage(e);
    } finally {
      t.close();
    }
  },
  Ir = (e, t, n, r, i) => (a, o, s, c, l, u) => {
    if (s !== null)
      try {
        let t = new s(a, c, u),
          r = new Map(),
          o = null;
        if (
          (Object.defineProperties(t, {
            channelCount: {
              get: () => u.channelCount,
              set: () => {
                throw e();
              },
            },
            channelCountMode: {
              get: () => `explicit`,
              set: () => {
                throw e();
              },
            },
            onprocessorerror: {
              get: () => o,
              set: (e) => {
                (typeof o == `function` && t.removeEventListener(`processorerror`, o),
                  (o = typeof e == `function` ? e : null),
                  typeof o == `function` && t.addEventListener(`processorerror`, o));
              },
            },
          }),
          (t.addEventListener = (
            (e) =>
            (...n) => {
              if (n[0] === `processorerror`) {
                let e =
                  typeof n[1] == `function`
                    ? n[1]
                    : typeof n[1] == `object` &&
                        n[1] !== null &&
                        typeof n[1].handleEvent == `function`
                      ? n[1].handleEvent
                      : null;
                if (e !== null) {
                  let t = r.get(n[1]);
                  t === void 0
                    ? ((n[1] = (t) => {
                        t.type === `error`
                          ? (Object.defineProperties(t, {
                              type: { value: `processorerror` },
                            }),
                            e(t))
                          : e(new ErrorEvent(n[0], { ...t }));
                      }),
                      r.set(e, n[1]))
                    : (n[1] = t);
                }
              }
              return (e.call(t, `error`, n[1], n[2]), e.call(t, ...n));
            }
          )(t.addEventListener)),
          (t.removeEventListener = (
            (e) =>
            (...n) => {
              if (n[0] === `processorerror`) {
                let e = r.get(n[1]);
                e !== void 0 && (r.delete(n[1]), (n[1] = e));
              }
              return (e.call(t, `error`, n[1], n[2]), e.call(t, n[0], n[1], n[2]));
            }
          )(t.removeEventListener)),
          u.numberOfOutputs !== 0)
        ) {
          let e = n(a, {
            channelCount: 1,
            channelCountMode: `explicit`,
            channelInterpretation: `discrete`,
            gain: 0,
          });
          return (
            t.connect(e).connect(a.destination),
            i(
              t,
              () => e.disconnect(),
              () => e.connect(a.destination),
            )
          );
        }
        return t;
      } catch (e) {
        throw e.code === 11 ? r() : e;
      }
    if (l === void 0) throw r();
    return (Fr(u), t(a, o, l, u));
  },
  Lr = (e, t) =>
    e === null ? 512 : Math.max(512, Math.min(16384, 2 ** Math.round(Math.log2(e * t)))),
  Rr = (e) =>
    new Promise((t, n) => {
      let { port1: r, port2: i } = new MessageChannel();
      ((r.onmessage = ({ data: e }) => {
        (r.close(), i.close(), t(e));
      }),
        (r.onmessageerror = ({ data: e }) => {
          (r.close(), i.close(), n(e));
        }),
        i.postMessage(e));
    }),
  zr = async (e, t) => new e(await Rr(t)),
  Br = (e, t, n, r) => {
    let i = ye.get(e);
    i === void 0 && ((i = new WeakMap()), ye.set(e, i));
    let a = zr(n, r);
    return (i.set(t, a), a);
  },
  Vr = (e, t, n, r, i, a, o, s, c, l, u, d, f) => (p, m, h, g) => {
    if (g.numberOfInputs === 0 && g.numberOfOutputs === 0) throw c();
    let _ = Array.isArray(g.outputChannelCount)
      ? g.outputChannelCount
      : Array.from(g.outputChannelCount);
    if (_.some((e) => e < 1)) throw c();
    if (_.length !== g.numberOfOutputs) throw t();
    if (g.channelCountMode !== `explicit`) throw c();
    let v = g.channelCount * g.numberOfInputs,
      y = _.reduce((e, t) => e + t, 0),
      b = h.parameterDescriptors === void 0 ? 0 : h.parameterDescriptors.length;
    if (v + b > 6 || y > 6) throw c();
    let x = new MessageChannel(),
      S = [],
      C = [];
    for (let e = 0; e < g.numberOfInputs; e += 1)
      (S.push(
        o(p, {
          channelCount: g.channelCount,
          channelCountMode: g.channelCountMode,
          channelInterpretation: g.channelInterpretation,
          gain: 1,
        }),
      ),
        C.push(
          i(p, {
            channelCount: g.channelCount,
            channelCountMode: `explicit`,
            channelInterpretation: `discrete`,
            numberOfOutputs: g.channelCount,
          }),
        ));
    let w = [];
    if (h.parameterDescriptors !== void 0)
      for (let {
        defaultValue: e,
        maxValue: t,
        minValue: n,
        name: r,
      } of h.parameterDescriptors) {
        let i = a(p, {
          channelCount: 1,
          channelCountMode: `explicit`,
          channelInterpretation: `discrete`,
          offset:
            g.parameterData[r] === void 0 ? (e === void 0 ? 0 : e) : g.parameterData[r],
        });
        (Object.defineProperties(i.offset, {
          defaultValue: { get: () => (e === void 0 ? 0 : e) },
          maxValue: { get: () => (t === void 0 ? N : t) },
          minValue: { get: () => (n === void 0 ? qe : n) },
        }),
          w.push(i));
      }
    let T = r(p, {
        channelCount: 1,
        channelCountMode: `explicit`,
        channelInterpretation: `speakers`,
        numberOfInputs: Math.max(1, v + b),
      }),
      E = Lr(m, p.sampleRate),
      D = s(p, E, v + b, Math.max(1, y)),
      O = i(p, {
        channelCount: Math.max(1, y),
        channelCountMode: `explicit`,
        channelInterpretation: `discrete`,
        numberOfOutputs: Math.max(1, y),
      }),
      k = [];
    for (let e = 0; e < g.numberOfOutputs; e += 1)
      k.push(
        r(p, {
          channelCount: 1,
          channelCountMode: `explicit`,
          channelInterpretation: `speakers`,
          numberOfInputs: _[e],
        }),
      );
    for (let e = 0; e < g.numberOfInputs; e += 1) {
      S[e].connect(C[e]);
      for (let t = 0; t < g.channelCount; t += 1)
        C[e].connect(T, t, e * g.channelCount + t);
    }
    let ee = new Ht(
      h.parameterDescriptors === void 0
        ? []
        : h.parameterDescriptors.map(({ name: e }, t) => {
            let n = w[t];
            return (n.connect(T, 0, v + t), n.start(0), [e, n.offset]);
          }),
    );
    T.connect(D);
    let te = g.channelInterpretation,
      ne = null,
      re = g.numberOfOutputs === 0 ? [D] : k,
      ie = {
        get bufferSize() {
          return E;
        },
        get channelCount() {
          return g.channelCount;
        },
        set channelCount(e) {
          throw n();
        },
        get channelCountMode() {
          return g.channelCountMode;
        },
        set channelCountMode(e) {
          throw n();
        },
        get channelInterpretation() {
          return te;
        },
        set channelInterpretation(e) {
          for (let t of S) t.channelInterpretation = e;
          te = e;
        },
        get context() {
          return D.context;
        },
        get inputs() {
          return S;
        },
        get numberOfInputs() {
          return g.numberOfInputs;
        },
        get numberOfOutputs() {
          return g.numberOfOutputs;
        },
        get onprocessorerror() {
          return ne;
        },
        set onprocessorerror(e) {
          (typeof ne == `function` && ie.removeEventListener(`processorerror`, ne),
            (ne = typeof e == `function` ? e : null),
            typeof ne == `function` && ie.addEventListener(`processorerror`, ne));
        },
        get parameters() {
          return ee;
        },
        get port() {
          return x.port2;
        },
        addEventListener(...e) {
          return D.addEventListener(e[0], e[1], e[2]);
        },
        connect: e.bind(null, re),
        disconnect: l.bind(null, re),
        dispatchEvent(...e) {
          return D.dispatchEvent(e[0]);
        },
        removeEventListener(...e) {
          return D.removeEventListener(e[0], e[1], e[2]);
        },
      },
      ae = new Map();
    ((x.port1.addEventListener = (
      (e) =>
      (...t) => {
        if (t[0] === `message`) {
          let e =
            typeof t[1] == `function`
              ? t[1]
              : typeof t[1] == `object` &&
                  t[1] !== null &&
                  typeof t[1].handleEvent == `function`
                ? t[1].handleEvent
                : null;
          if (e !== null) {
            let n = ae.get(t[1]);
            n === void 0
              ? ((t[1] = (t) => {
                  u(p.currentTime, p.sampleRate, () => e(t));
                }),
                ae.set(e, t[1]))
              : (t[1] = n);
          }
        }
        return e.call(x.port1, t[0], t[1], t[2]);
      }
    )(x.port1.addEventListener)),
      (x.port1.removeEventListener = (
        (e) =>
        (...t) => {
          if (t[0] === `message`) {
            let e = ae.get(t[1]);
            e !== void 0 && (ae.delete(t[1]), (t[1] = e));
          }
          return e.call(x.port1, t[0], t[1], t[2]);
        }
      )(x.port1.removeEventListener)));
    let oe = null;
    (Object.defineProperty(x.port1, 'onmessage', {
      get: () => oe,
      set: (e) => {
        (typeof oe == `function` && x.port1.removeEventListener(`message`, oe),
          (oe = typeof e == `function` ? e : null),
          typeof oe == `function` &&
            (x.port1.addEventListener(`message`, oe), x.port1.start()));
      },
    }),
      (h.prototype.port = x.port1));
    let A = null;
    Br(p, ie, h, g).then((e) => (A = e));
    let se = qt(g.numberOfInputs, g.channelCount),
      ce = qt(g.numberOfOutputs, _),
      le =
        h.parameterDescriptors === void 0
          ? []
          : h.parameterDescriptors.reduce(
              (e, { name: t }) => ({ ...e, [t]: new Float32Array(128) }),
              {},
            ),
      j = !0,
      ue = () => {
        g.numberOfOutputs > 0 && D.disconnect(O);
        for (let e = 0, t = 0; e < g.numberOfOutputs; e += 1) {
          let n = k[e];
          for (let r = 0; r < _[e]; r += 1) O.disconnect(n, t + r, r);
          t += _[e];
        }
      },
      de = new Map();
    D.onaudioprocess = ({ inputBuffer: e, outputBuffer: t }) => {
      if (A !== null) {
        let n = d(ie);
        for (let r = 0; r < E; r += 128) {
          for (let t = 0; t < g.numberOfInputs; t += 1)
            for (let n = 0; n < g.channelCount; n += 1) Gt(e, se[t], n, n, r);
          h.parameterDescriptors !== void 0 &&
            h.parameterDescriptors.forEach(({ name: t }, n) => {
              Gt(e, le, t, v + n, r);
            });
          for (let e = 0; e < g.numberOfInputs; e += 1)
            for (let t = 0; t < _[e]; t += 1)
              ce[e][t].byteLength === 0 && (ce[e][t] = new Float32Array(128));
          try {
            let e = se.map((e, t) => {
              if (n[t].size > 0) return (de.set(t, E / 128), e);
              let r = de.get(t);
              return r === void 0
                ? []
                : (e.every((e) => e.every((e) => e === 0)) &&
                    (r === 1 ? de.delete(t) : de.set(t, r - 1)),
                  e);
            });
            j = u(p.currentTime + r / p.sampleRate, p.sampleRate, () =>
              A.process(e, ce, le),
            );
            for (let e = 0, n = 0; e < g.numberOfOutputs; e += 1) {
              for (let i = 0; i < _[e]; i += 1) Kt(t, ce[e], i, n + i, r);
              n += _[e];
            }
          } catch (e) {
            ((j = !1),
              ie.dispatchEvent(
                new ErrorEvent(`processorerror`, {
                  colno: e.colno,
                  filename: e.filename,
                  lineno: e.lineno,
                  message: e.message,
                }),
              ));
          }
          if (!j) {
            for (let e = 0; e < g.numberOfInputs; e += 1) {
              S[e].disconnect(C[e]);
              for (let t = 0; t < g.channelCount; t += 1)
                C[r].disconnect(T, t, e * g.channelCount + t);
            }
            if (h.parameterDescriptors !== void 0) {
              let e = h.parameterDescriptors.length;
              for (let t = 0; t < e; t += 1) {
                let e = w[t];
                (e.disconnect(T, 0, v + t), e.stop());
              }
            }
            (T.disconnect(D), (D.onaudioprocess = null), fe ? ue() : he());
            break;
          }
        }
      }
    };
    let fe = !1,
      pe = o(p, {
        channelCount: 1,
        channelCountMode: `explicit`,
        channelInterpretation: `discrete`,
        gain: 0,
      }),
      me = () => D.connect(pe).connect(p.destination),
      he = () => {
        (D.disconnect(pe), pe.disconnect());
      };
    return (
      me(),
      f(
        ie,
        () => {
          if (j) {
            (he(), g.numberOfOutputs > 0 && D.connect(O));
            for (let e = 0, t = 0; e < g.numberOfOutputs; e += 1) {
              let n = k[e];
              for (let r = 0; r < _[e]; r += 1) O.connect(n, t + r, r);
              t += _[e];
            }
          }
          fe = !0;
        },
        () => {
          (j && (me(), ue()), (fe = !1));
        },
      )
    );
  },
  Hr = (e, t) => {
    let n = e.createBiquadFilter();
    return (
      R(n, t),
      z(n, t, `Q`),
      z(n, t, `detune`),
      z(n, t, `frequency`),
      z(n, t, `gain`),
      L(n, t, `type`),
      n
    );
  },
  Ur = (e, t) => (n, r) => {
    let i = n.createChannelMerger(r.numberOfInputs);
    return (e !== null && e.name === `webkitAudioContext` && t(n, i), R(i, r), i);
  },
  Wr = (e) => {
    let t = e.numberOfOutputs;
    (Object.defineProperty(e, 'channelCount', {
      get: () => t,
      set: (e) => {
        if (e !== t) throw I();
      },
    }),
      Object.defineProperty(e, 'channelCountMode', {
        get: () => `explicit`,
        set: (e) => {
          if (e !== `explicit`) throw I();
        },
      }),
      Object.defineProperty(e, 'channelInterpretation', {
        get: () => `discrete`,
        set: (e) => {
          if (e !== `discrete`) throw I();
        },
      }));
  },
  Gr = (e, t) => {
    let n = e.createChannelSplitter(t.numberOfOutputs);
    return (R(n, t), Wr(n), n);
  },
  Kr = (e, t, n, r, i) => (a, o) => {
    if (a.createConstantSource === void 0) return n(a, o);
    let s = a.createConstantSource();
    return (
      R(s, o),
      z(s, o, `offset`),
      t(r, () => r(a)) || kr(s),
      t(i, () => i(a)) || Ar(s),
      e(a, s),
      s
    );
  },
  qr = (e, t) => (
    (e.connect = t.connect.bind(t)),
    (e.disconnect = t.disconnect.bind(t)),
    e
  ),
  Jr =
    (e, t, n, r) =>
    (i, { offset: a, ...o }) => {
      let s = i.createBuffer(1, 2, 44100),
        c = t(i, {
          buffer: null,
          channelCount: 2,
          channelCountMode: `max`,
          channelInterpretation: `speakers`,
          loop: !1,
          loopEnd: 0,
          loopStart: 0,
          playbackRate: 1,
        }),
        l = n(i, { ...o, gain: a }),
        u = s.getChannelData(0);
      return (
        (u[0] = 1),
        (u[1] = 1),
        (c.buffer = s),
        (c.loop = !0),
        e(i, c),
        r(
          qr(
            {
              get bufferSize() {},
              get channelCount() {
                return l.channelCount;
              },
              set channelCount(e) {
                l.channelCount = e;
              },
              get channelCountMode() {
                return l.channelCountMode;
              },
              set channelCountMode(e) {
                l.channelCountMode = e;
              },
              get channelInterpretation() {
                return l.channelInterpretation;
              },
              set channelInterpretation(e) {
                l.channelInterpretation = e;
              },
              get context() {
                return l.context;
              },
              get inputs() {
                return [];
              },
              get numberOfInputs() {
                return c.numberOfInputs;
              },
              get numberOfOutputs() {
                return l.numberOfOutputs;
              },
              get offset() {
                return l.gain;
              },
              get onended() {
                return c.onended;
              },
              set onended(e) {
                c.onended = e;
              },
              addEventListener(...e) {
                return c.addEventListener(e[0], e[1], e[2]);
              },
              dispatchEvent(...e) {
                return c.dispatchEvent(e[0]);
              },
              removeEventListener(...e) {
                return c.removeEventListener(e[0], e[1], e[2]);
              },
              start(e = 0) {
                c.start.call(c, e);
              },
              stop(e = 0) {
                c.stop.call(c, e);
              },
            },
            l,
          ),
          () => c.connect(l),
          () => c.disconnect(l),
        )
      );
    },
  Yr = (e, t) => (n, r) => {
    let i = n.createConvolver();
    if (
      (R(i, r),
      r.disableNormalization === i.normalize && (i.normalize = !r.disableNormalization),
      L(i, r, `buffer`),
      r.channelCount > 2 ||
        (t(
          i,
          `channelCount`,
          (e) => () => e.call(i),
          (t) => (n) => {
            if (n > 2) throw e();
            return t.call(i, n);
          },
        ),
        r.channelCountMode === `max`))
    )
      throw e();
    return (
      t(
        i,
        `channelCountMode`,
        (e) => () => e.call(i),
        (t) => (n) => {
          if (n === `max`) throw e();
          return t.call(i, n);
        },
      ),
      i
    );
  },
  Xr = (e, t) => {
    let n = e.createDelay(t.maxDelayTime);
    return (R(n, t), z(n, t, `delayTime`), n);
  },
  Zr = (e) => (t, n) => {
    let r = t.createDynamicsCompressor();
    if ((R(r, n), n.channelCount > 2 || n.channelCountMode === `max`)) throw e();
    return (
      z(r, n, `attack`),
      z(r, n, `knee`),
      z(r, n, `ratio`),
      z(r, n, `release`),
      z(r, n, `threshold`),
      r
    );
  },
  Qr = (e, t) => {
    let n = e.createGain();
    return (R(n, t), z(n, t, `gain`), n);
  },
  $r = (e) => (t, n, r) => {
    if (t.createIIRFilter === void 0) return e(t, n, r);
    let i = t.createIIRFilter(r.feedforward, r.feedback);
    return (R(i, r), i);
  };
function ei(e, t) {
  let n = t[0] * t[0] + t[1] * t[1];
  return [(e[0] * t[0] + e[1] * t[1]) / n, (e[1] * t[0] - e[0] * t[1]) / n];
}
function ti(e, t) {
  return [e[0] * t[0] - e[1] * t[1], e[0] * t[1] + e[1] * t[0]];
}
function ni(e, t) {
  let n = [0, 0];
  for (let r = e.length - 1; r >= 0; --r) ((n = ti(n, t)), (n[0] += e[r]));
  return n;
}
var ri =
    (e, t, n, r) =>
    (
      i,
      a,
      {
        channelCount: o,
        channelCountMode: s,
        channelInterpretation: c,
        feedback: l,
        feedforward: u,
      },
    ) => {
      let d = Lr(a, i.sampleRate),
        f = l instanceof Float64Array ? l : new Float64Array(l),
        p = u instanceof Float64Array ? u : new Float64Array(u),
        m = f.length,
        h = p.length,
        g = Math.min(m, h);
      if (m === 0 || m > 20) throw r();
      if (f[0] === 0) throw t();
      if (h === 0 || h > 20) throw r();
      if (p[0] === 0) throw t();
      if (f[0] !== 1) {
        for (let e = 0; e < h; e += 1) p[e] /= f[0];
        for (let e = 1; e < m; e += 1) f[e] /= f[0];
      }
      let _ = n(i, d, o, o);
      ((_.channelCount = o), (_.channelCountMode = s), (_.channelInterpretation = c));
      let v = [],
        y = [],
        b = [];
      for (let e = 0; e < o; e += 1) {
        v.push(0);
        let e = new Float32Array(32),
          t = new Float32Array(32);
        (e.fill(0), t.fill(0), y.push(e), b.push(t));
      }
      _.onaudioprocess = (e) => {
        let t = e.inputBuffer,
          n = e.outputBuffer,
          r = t.numberOfChannels;
        for (let e = 0; e < r; e += 1) {
          let r = t.getChannelData(e),
            i = n.getChannelData(e);
          v[e] = nr(f, m, p, h, g, y[e], b[e], v[e], 32, r, i);
        }
      };
      let x = i.sampleRate / 2;
      return qr(
        {
          get bufferSize() {
            return d;
          },
          get channelCount() {
            return _.channelCount;
          },
          set channelCount(e) {
            _.channelCount = e;
          },
          get channelCountMode() {
            return _.channelCountMode;
          },
          set channelCountMode(e) {
            _.channelCountMode = e;
          },
          get channelInterpretation() {
            return _.channelInterpretation;
          },
          set channelInterpretation(e) {
            _.channelInterpretation = e;
          },
          get context() {
            return _.context;
          },
          get inputs() {
            return [_];
          },
          get numberOfInputs() {
            return _.numberOfInputs;
          },
          get numberOfOutputs() {
            return _.numberOfOutputs;
          },
          addEventListener(...e) {
            return _.addEventListener(e[0], e[1], e[2]);
          },
          dispatchEvent(...e) {
            return _.dispatchEvent(e[0]);
          },
          getFrequencyResponse(t, n, r) {
            if (t.length !== n.length || n.length !== r.length) throw e();
            let i = t.length;
            for (let e = 0; e < i; e += 1) {
              let i = -Math.PI * (t[e] / x),
                a = [Math.cos(i), Math.sin(i)],
                o = ei(ni(p, a), ni(f, a));
              ((n[e] = Math.sqrt(o[0] * o[0] + o[1] * o[1])),
                (r[e] = Math.atan2(o[1], o[0])));
            }
          },
          removeEventListener(...e) {
            return _.removeEventListener(e[0], e[1], e[2]);
          },
        },
        _,
      );
    },
  ii = (e, t) => e.createMediaElementSource(t.mediaElement),
  ai = (e, t) => {
    let n = e.createMediaStreamDestination();
    return (
      R(n, t),
      n.numberOfOutputs === 1 &&
        Object.defineProperty(n, 'numberOfOutputs', { get: () => 0 }),
      n
    );
  },
  oi = (e, { mediaStream: t }) => {
    let n = t.getAudioTracks();
    n.sort((e, t) => (e.id < t.id ? -1 : +(e.id > t.id)));
    let r = n.slice(0, 1),
      i = e.createMediaStreamSource(new MediaStream(r));
    return (Object.defineProperty(i, 'mediaStream', { value: t }), i);
  },
  si =
    (e, t) =>
    (n, { mediaStreamTrack: r }) => {
      if (typeof n.createMediaStreamTrackSource == `function`)
        return n.createMediaStreamTrackSource(r);
      let i = new MediaStream([r]),
        a = n.createMediaStreamSource(i);
      if (r.kind !== `audio`) throw e();
      if (t(n)) throw TypeError();
      return a;
    },
  ci = (e) =>
    e === null
      ? null
      : e.hasOwnProperty(`OfflineAudioContext`)
        ? e.OfflineAudioContext
        : e.hasOwnProperty(`webkitOfflineAudioContext`)
          ? e.webkitOfflineAudioContext
          : null,
  li = (e, t, n, r, i, a) => (o, s) => {
    let c = o.createOscillator();
    return (
      R(c, s),
      z(c, s, `detune`),
      z(c, s, `frequency`),
      s.periodicWave === void 0 ? L(c, s, `type`) : c.setPeriodicWave(s.periodicWave),
      t(n, () => n(o)) || kr(c),
      t(r, () => r(o)) || a(c, o),
      t(i, () => i(o)) || Ar(c),
      e(o, c),
      c
    );
  },
  ui = (e) => (t, n) => {
    let r = t.createPanner();
    return r.orientationX === void 0
      ? e(t, n)
      : (R(r, n),
        z(r, n, `orientationX`),
        z(r, n, `orientationY`),
        z(r, n, `orientationZ`),
        z(r, n, `positionX`),
        z(r, n, `positionY`),
        z(r, n, `positionZ`),
        L(r, n, `coneInnerAngle`),
        L(r, n, `coneOuterAngle`),
        L(r, n, `coneOuterGain`),
        L(r, n, `distanceModel`),
        L(r, n, `maxDistance`),
        L(r, n, `panningModel`),
        L(r, n, `refDistance`),
        L(r, n, `rolloffFactor`),
        r);
  },
  di =
    (e, t, n, r, i, a, o, s, c, l) =>
    (
      u,
      {
        coneInnerAngle: d,
        coneOuterAngle: f,
        coneOuterGain: p,
        distanceModel: m,
        maxDistance: h,
        orientationX: g,
        orientationY: _,
        orientationZ: v,
        panningModel: y,
        positionX: b,
        positionY: x,
        positionZ: S,
        refDistance: C,
        rolloffFactor: w,
        ...T
      },
    ) => {
      let E = u.createPanner();
      if (T.channelCount > 2 || T.channelCountMode === `max`) throw o();
      R(E, T);
      let D = {
          channelCount: 1,
          channelCountMode: `explicit`,
          channelInterpretation: `discrete`,
        },
        O = n(u, { ...D, channelInterpretation: `speakers`, numberOfInputs: 6 }),
        k = r(u, { ...T, gain: 1 }),
        ee = r(u, { ...D, gain: 1 }),
        te = r(u, { ...D, gain: 0 }),
        ne = r(u, { ...D, gain: 0 }),
        re = r(u, { ...D, gain: 0 }),
        ie = r(u, { ...D, gain: 0 }),
        ae = r(u, { ...D, gain: 0 }),
        oe = i(u, 256, 6, 1),
        A = a(u, { ...D, curve: new Float32Array([1, 1]), oversample: `none` }),
        se = [g, _, v],
        ce = [b, x, S],
        le = new Float32Array(1);
      ((oe.onaudioprocess = ({ inputBuffer: e }) => {
        let t = [c(e, le, 0), c(e, le, 1), c(e, le, 2)];
        t.some((e, t) => e !== se[t]) && (E.setOrientation(...t), (se = t));
        let n = [c(e, le, 3), c(e, le, 4), c(e, le, 5)];
        n.some((e, t) => e !== ce[t]) && (E.setPosition(...n), (ce = n));
      }),
        Object.defineProperty(te.gain, 'defaultValue', { get: () => 0 }),
        Object.defineProperty(ne.gain, 'defaultValue', { get: () => 0 }),
        Object.defineProperty(re.gain, 'defaultValue', { get: () => 0 }),
        Object.defineProperty(ie.gain, 'defaultValue', { get: () => 0 }),
        Object.defineProperty(ae.gain, 'defaultValue', { get: () => 0 }));
      let j = {
        get bufferSize() {},
        get channelCount() {
          return E.channelCount;
        },
        set channelCount(e) {
          if (e > 2) throw o();
          ((k.channelCount = e), (E.channelCount = e));
        },
        get channelCountMode() {
          return E.channelCountMode;
        },
        set channelCountMode(e) {
          if (e === `max`) throw o();
          ((k.channelCountMode = e), (E.channelCountMode = e));
        },
        get channelInterpretation() {
          return E.channelInterpretation;
        },
        set channelInterpretation(e) {
          ((k.channelInterpretation = e), (E.channelInterpretation = e));
        },
        get coneInnerAngle() {
          return E.coneInnerAngle;
        },
        set coneInnerAngle(e) {
          E.coneInnerAngle = e;
        },
        get coneOuterAngle() {
          return E.coneOuterAngle;
        },
        set coneOuterAngle(e) {
          E.coneOuterAngle = e;
        },
        get coneOuterGain() {
          return E.coneOuterGain;
        },
        set coneOuterGain(e) {
          if (e < 0 || e > 1) throw t();
          E.coneOuterGain = e;
        },
        get context() {
          return E.context;
        },
        get distanceModel() {
          return E.distanceModel;
        },
        set distanceModel(e) {
          E.distanceModel = e;
        },
        get inputs() {
          return [k];
        },
        get maxDistance() {
          return E.maxDistance;
        },
        set maxDistance(e) {
          if (e < 0) throw RangeError();
          E.maxDistance = e;
        },
        get numberOfInputs() {
          return E.numberOfInputs;
        },
        get numberOfOutputs() {
          return E.numberOfOutputs;
        },
        get orientationX() {
          return ee.gain;
        },
        get orientationY() {
          return te.gain;
        },
        get orientationZ() {
          return ne.gain;
        },
        get panningModel() {
          return E.panningModel;
        },
        set panningModel(e) {
          E.panningModel = e;
        },
        get positionX() {
          return re.gain;
        },
        get positionY() {
          return ie.gain;
        },
        get positionZ() {
          return ae.gain;
        },
        get refDistance() {
          return E.refDistance;
        },
        set refDistance(e) {
          if (e < 0) throw RangeError();
          E.refDistance = e;
        },
        get rolloffFactor() {
          return E.rolloffFactor;
        },
        set rolloffFactor(e) {
          if (e < 0) throw RangeError();
          E.rolloffFactor = e;
        },
        addEventListener(...e) {
          return k.addEventListener(e[0], e[1], e[2]);
        },
        dispatchEvent(...e) {
          return k.dispatchEvent(e[0]);
        },
        removeEventListener(...e) {
          return k.removeEventListener(e[0], e[1], e[2]);
        },
      };
      return (
        d !== j.coneInnerAngle && (j.coneInnerAngle = d),
        f !== j.coneOuterAngle && (j.coneOuterAngle = f),
        p !== j.coneOuterGain && (j.coneOuterGain = p),
        m !== j.distanceModel && (j.distanceModel = m),
        h !== j.maxDistance && (j.maxDistance = h),
        g !== j.orientationX.value && (j.orientationX.value = g),
        _ !== j.orientationY.value && (j.orientationY.value = _),
        v !== j.orientationZ.value && (j.orientationZ.value = v),
        y !== j.panningModel && (j.panningModel = y),
        b !== j.positionX.value && (j.positionX.value = b),
        x !== j.positionY.value && (j.positionY.value = x),
        S !== j.positionZ.value && (j.positionZ.value = S),
        C !== j.refDistance && (j.refDistance = C),
        w !== j.rolloffFactor && (j.rolloffFactor = w),
        (se[0] !== 1 || se[1] !== 0 || se[2] !== 0) && E.setOrientation(...se),
        (ce[0] !== 0 || ce[1] !== 0 || ce[2] !== 0) && E.setPosition(...ce),
        l(
          qr(j, E),
          () => {
            (k.connect(E),
              e(k, A, 0, 0),
              A.connect(ee).connect(O, 0, 0),
              A.connect(te).connect(O, 0, 1),
              A.connect(ne).connect(O, 0, 2),
              A.connect(re).connect(O, 0, 3),
              A.connect(ie).connect(O, 0, 4),
              A.connect(ae).connect(O, 0, 5),
              O.connect(oe).connect(u.destination));
          },
          () => {
            (k.disconnect(E),
              s(k, A, 0, 0),
              A.disconnect(ee),
              ee.disconnect(O),
              A.disconnect(te),
              te.disconnect(O),
              A.disconnect(ne),
              ne.disconnect(O),
              A.disconnect(re),
              re.disconnect(O),
              A.disconnect(ie),
              ie.disconnect(O),
              A.disconnect(ae),
              ae.disconnect(O),
              O.disconnect(oe),
              oe.disconnect(u.destination));
          },
        )
      );
    },
  fi =
    (e) =>
    (t, { disableNormalization: n, imag: r, real: i }) => {
      let a = r instanceof Float32Array ? r : new Float32Array(r),
        o = i instanceof Float32Array ? i : new Float32Array(i),
        s = t.createPeriodicWave(o, a, { disableNormalization: n });
      if (Array.from(r).length < 2) throw e();
      return s;
    },
  pi = (e, t, n, r) => e.createScriptProcessor(t, n, r),
  mi = (e, t) => (n, r) => {
    let i = r.channelCountMode;
    if (i === `clamped-max`) throw t();
    if (n.createStereoPanner === void 0) return e(n, r);
    let a = n.createStereoPanner();
    return (
      R(a, r),
      z(a, r, `pan`),
      Object.defineProperty(a, 'channelCountMode', {
        get: () => i,
        set: (e) => {
          if (e !== i) throw t();
        },
      }),
      a
    );
  },
  hi = (e, t, n, r, i, a) => {
    let o = 16385,
      s = new Float32Array([1, 1]),
      c = Math.PI / 2,
      l = {
        channelCount: 1,
        channelCountMode: `explicit`,
        channelInterpretation: `discrete`,
      },
      u = { ...l, oversample: `none` },
      d = (e, t, i, a) => {
        let d = new Float32Array(o),
          f = new Float32Array(o);
        for (let e = 0; e < o; e += 1) {
          let t = (e / (o - 1)) * c;
          ((d[e] = Math.cos(t)), (f[e] = Math.sin(t)));
        }
        let p = n(e, { ...l, gain: 0 }),
          m = r(e, { ...u, curve: d }),
          h = r(e, { ...u, curve: s }),
          g = n(e, { ...l, gain: 0 }),
          _ = r(e, { ...u, curve: f });
        return {
          connectGraph() {
            (t.connect(p),
              t.connect(h.inputs === void 0 ? h : h.inputs[0]),
              t.connect(g),
              h.connect(i),
              i.connect(m.inputs === void 0 ? m : m.inputs[0]),
              i.connect(_.inputs === void 0 ? _ : _.inputs[0]),
              m.connect(p.gain),
              _.connect(g.gain),
              p.connect(a, 0, 0),
              g.connect(a, 0, 1));
          },
          disconnectGraph() {
            (t.disconnect(p),
              t.disconnect(h.inputs === void 0 ? h : h.inputs[0]),
              t.disconnect(g),
              h.disconnect(i),
              i.disconnect(m.inputs === void 0 ? m : m.inputs[0]),
              i.disconnect(_.inputs === void 0 ? _ : _.inputs[0]),
              m.disconnect(p.gain),
              _.disconnect(g.gain),
              p.disconnect(a, 0, 0),
              g.disconnect(a, 0, 1));
          },
        };
      },
      f = (e, i, a, d) => {
        let f = new Float32Array(o),
          p = new Float32Array(o),
          m = new Float32Array(o),
          h = new Float32Array(o),
          g = 8192;
        for (let e = 0; e < o; e += 1)
          if (e > g) {
            let t = ((e - g) / (o - 1 - g)) * c;
            ((f[e] = Math.cos(t)), (p[e] = Math.sin(t)), (m[e] = 0), (h[e] = 1));
          } else {
            let t = (e / (o - 1 - g)) * c;
            ((f[e] = 1), (p[e] = 0), (m[e] = Math.cos(t)), (h[e] = Math.sin(t)));
          }
        let _ = t(e, {
            channelCount: 2,
            channelCountMode: `explicit`,
            channelInterpretation: `discrete`,
            numberOfOutputs: 2,
          }),
          v = n(e, { ...l, gain: 0 }),
          y = r(e, { ...u, curve: f }),
          b = n(e, { ...l, gain: 0 }),
          x = r(e, { ...u, curve: p }),
          S = r(e, { ...u, curve: s }),
          C = n(e, { ...l, gain: 0 }),
          w = r(e, { ...u, curve: m }),
          T = n(e, { ...l, gain: 0 }),
          E = r(e, { ...u, curve: h });
        return {
          connectGraph() {
            (i.connect(_),
              i.connect(S.inputs === void 0 ? S : S.inputs[0]),
              _.connect(v, 0),
              _.connect(b, 0),
              _.connect(C, 1),
              _.connect(T, 1),
              S.connect(a),
              a.connect(y.inputs === void 0 ? y : y.inputs[0]),
              a.connect(x.inputs === void 0 ? x : x.inputs[0]),
              a.connect(w.inputs === void 0 ? w : w.inputs[0]),
              a.connect(E.inputs === void 0 ? E : E.inputs[0]),
              y.connect(v.gain),
              x.connect(b.gain),
              w.connect(C.gain),
              E.connect(T.gain),
              v.connect(d, 0, 0),
              C.connect(d, 0, 0),
              b.connect(d, 0, 1),
              T.connect(d, 0, 1));
          },
          disconnectGraph() {
            (i.disconnect(_),
              i.disconnect(S.inputs === void 0 ? S : S.inputs[0]),
              _.disconnect(v, 0),
              _.disconnect(b, 0),
              _.disconnect(C, 1),
              _.disconnect(T, 1),
              S.disconnect(a),
              a.disconnect(y.inputs === void 0 ? y : y.inputs[0]),
              a.disconnect(x.inputs === void 0 ? x : x.inputs[0]),
              a.disconnect(w.inputs === void 0 ? w : w.inputs[0]),
              a.disconnect(E.inputs === void 0 ? E : E.inputs[0]),
              y.disconnect(v.gain),
              x.disconnect(b.gain),
              w.disconnect(C.gain),
              E.disconnect(T.gain),
              v.disconnect(d, 0, 0),
              C.disconnect(d, 0, 0),
              b.disconnect(d, 0, 1),
              T.disconnect(d, 0, 1));
          },
        };
      },
      p = (e, t, n, r, a) => {
        if (t === 1) return d(e, n, r, a);
        if (t === 2) return f(e, n, r, a);
        throw i();
      };
    return (t, { channelCount: r, channelCountMode: o, pan: s, ...c }) => {
      if (o === `max`) throw i();
      let l = e(t, { ...c, channelCount: 1, channelCountMode: o, numberOfInputs: 2 }),
        u = n(t, { ...c, channelCount: r, channelCountMode: o, gain: 1 }),
        d = n(t, {
          channelCount: 1,
          channelCountMode: `explicit`,
          channelInterpretation: `discrete`,
          gain: s,
        }),
        { connectGraph: f, disconnectGraph: m } = p(t, r, u, d, l);
      (Object.defineProperty(d.gain, 'defaultValue', { get: () => 0 }),
        Object.defineProperty(d.gain, 'maxValue', { get: () => 1 }),
        Object.defineProperty(d.gain, 'minValue', { get: () => -1 }));
      let h = {
          get bufferSize() {},
          get channelCount() {
            return u.channelCount;
          },
          set channelCount(e) {
            (u.channelCount !== e &&
              (g && m(),
              ({ connectGraph: f, disconnectGraph: m } = p(t, e, u, d, l)),
              g && f()),
              (u.channelCount = e));
          },
          get channelCountMode() {
            return u.channelCountMode;
          },
          set channelCountMode(e) {
            if (e === `clamped-max` || e === `max`) throw i();
            u.channelCountMode = e;
          },
          get channelInterpretation() {
            return u.channelInterpretation;
          },
          set channelInterpretation(e) {
            u.channelInterpretation = e;
          },
          get context() {
            return u.context;
          },
          get inputs() {
            return [u];
          },
          get numberOfInputs() {
            return u.numberOfInputs;
          },
          get numberOfOutputs() {
            return u.numberOfOutputs;
          },
          get pan() {
            return d.gain;
          },
          addEventListener(...e) {
            return u.addEventListener(e[0], e[1], e[2]);
          },
          dispatchEvent(...e) {
            return u.dispatchEvent(e[0]);
          },
          removeEventListener(...e) {
            return u.removeEventListener(e[0], e[1], e[2]);
          },
        },
        g = !1;
      return a(
        qr(h, l),
        () => {
          (f(), (g = !0));
        },
        () => {
          (m(), (g = !1));
        },
      );
    };
  },
  gi = (e, t, n, r, i, a, o) => (s, c) => {
    let l = s.createWaveShaper();
    if (
      a !== null &&
      a.name === `webkitAudioContext` &&
      s.createGain().gain.automationRate === void 0
    )
      return n(s, c);
    R(l, c);
    let u =
      c.curve === null || c.curve instanceof Float32Array
        ? c.curve
        : new Float32Array(c.curve);
    if (u !== null && u.length < 2) throw t();
    (L(l, { curve: u }, `curve`), L(l, c, `oversample`));
    let d = null,
      f = !1;
    return (
      o(
        l,
        `curve`,
        (e) => () => e.call(l),
        (t) => (n) => (
          t.call(l, n),
          f &&
            (r(n) && d === null
              ? (d = e(s, l))
              : !r(n) && d !== null && (d(), (d = null))),
          n
        ),
      ),
      i(
        l,
        () => {
          ((f = !0), r(l.curve) && (d = e(s, l)));
        },
        () => {
          ((f = !1), d !== null && (d(), (d = null)));
        },
      )
    );
  },
  _i =
    (e, t, n, r, i) =>
    (a, { curve: o, oversample: s, ...c }) => {
      let l = a.createWaveShaper(),
        u = a.createWaveShaper();
      (R(l, c), R(u, c));
      let d = n(a, { ...c, gain: 1 }),
        f = n(a, { ...c, gain: -1 }),
        p = n(a, { ...c, gain: 1 }),
        m = n(a, { ...c, gain: -1 }),
        h = null,
        g = !1,
        _ = null,
        v = {
          get bufferSize() {},
          get channelCount() {
            return l.channelCount;
          },
          set channelCount(e) {
            ((d.channelCount = e),
              (f.channelCount = e),
              (l.channelCount = e),
              (p.channelCount = e),
              (u.channelCount = e),
              (m.channelCount = e));
          },
          get channelCountMode() {
            return l.channelCountMode;
          },
          set channelCountMode(e) {
            ((d.channelCountMode = e),
              (f.channelCountMode = e),
              (l.channelCountMode = e),
              (p.channelCountMode = e),
              (u.channelCountMode = e),
              (m.channelCountMode = e));
          },
          get channelInterpretation() {
            return l.channelInterpretation;
          },
          set channelInterpretation(e) {
            ((d.channelInterpretation = e),
              (f.channelInterpretation = e),
              (l.channelInterpretation = e),
              (p.channelInterpretation = e),
              (u.channelInterpretation = e),
              (m.channelInterpretation = e));
          },
          get context() {
            return l.context;
          },
          get curve() {
            return _;
          },
          set curve(n) {
            if (n !== null && n.length < 2) throw t();
            if (n === null) ((l.curve = n), (u.curve = n));
            else {
              let e = n.length,
                t = new Float32Array(e + 2 - (e % 2)),
                r = new Float32Array(e + 2 - (e % 2));
              ((t[0] = n[0]), (r[0] = -n[e - 1]));
              let i = Math.ceil((e + 1) / 2),
                a = (e + 1) / 2 - 1;
              for (let o = 1; o < i; o += 1) {
                let s = (o / i) * a,
                  c = Math.floor(s),
                  l = Math.ceil(s);
                ((t[o] = c === l ? n[c] : (1 - (s - c)) * n[c] + (1 - (l - s)) * n[l]),
                  (r[o] =
                    c === l
                      ? -n[e - 1 - c]
                      : -((1 - (s - c)) * n[e - 1 - c]) - (1 - (l - s)) * n[e - 1 - l]));
              }
              ((t[i] = e % 2 == 1 ? n[i - 1] : (n[i - 2] + n[i - 1]) / 2),
                (l.curve = t),
                (u.curve = r));
            }
            ((_ = n),
              g &&
                (r(_) && h === null ? (h = e(a, d)) : h !== null && (h(), (h = null))));
          },
          get inputs() {
            return [d];
          },
          get numberOfInputs() {
            return l.numberOfInputs;
          },
          get numberOfOutputs() {
            return l.numberOfOutputs;
          },
          get oversample() {
            return l.oversample;
          },
          set oversample(e) {
            ((l.oversample = e), (u.oversample = e));
          },
          addEventListener(...e) {
            return d.addEventListener(e[0], e[1], e[2]);
          },
          dispatchEvent(...e) {
            return d.dispatchEvent(e[0]);
          },
          removeEventListener(...e) {
            return d.removeEventListener(e[0], e[1], e[2]);
          },
        };
      return (
        o !== null && (v.curve = o instanceof Float32Array ? o : new Float32Array(o)),
        s !== v.oversample && (v.oversample = s),
        i(
          qr(v, p),
          () => {
            (d.connect(l).connect(p),
              d.connect(f).connect(u).connect(m).connect(p),
              (g = !0),
              r(_) && (h = e(a, d)));
          },
          () => {
            (d.disconnect(l),
              l.disconnect(p),
              d.disconnect(f),
              f.disconnect(u),
              u.disconnect(m),
              m.disconnect(p),
              (g = !1),
              h !== null && (h(), (h = null)));
          },
        )
      );
    },
  B = () => new DOMException(``, `NotSupportedError`),
  vi = { numberOfChannels: 1 },
  yi = (e, t, n, r, i) =>
    class extends e {
      constructor(e, n, i) {
        let a;
        if (typeof e == `number` && n !== void 0 && i !== void 0)
          a = { length: n, numberOfChannels: e, sampleRate: i };
        else if (typeof e == `object`) a = e;
        else throw Error(`The given parameters are not valid.`);
        let { length: o, numberOfChannels: s, sampleRate: c } = { ...vi, ...a },
          l = r(s, o, c);
        (t(Sr, () => Sr(l)) ||
          l.addEventListener(
            `statechange`,
            (() => {
              let e = 0,
                t = (n) => {
                  this._state === `running` &&
                    (e > 0
                      ? (l.removeEventListener(`statechange`, t),
                        n.stopImmediatePropagation(),
                        this._waitForThePromiseToSettle(n))
                      : (e += 1));
                };
              return t;
            })(),
          ),
          super(l, s),
          (this._length = o),
          (this._nativeOfflineAudioContext = l),
          (this._state = null));
      }
      get length() {
        return this._nativeOfflineAudioContext.length === void 0
          ? this._length
          : this._nativeOfflineAudioContext.length;
      }
      get state() {
        return this._state === null ? this._nativeOfflineAudioContext.state : this._state;
      }
      startRendering() {
        return this._state === `running`
          ? Promise.reject(n())
          : ((this._state = `running`),
            i(this.destination, this._nativeOfflineAudioContext).finally(() => {
              ((this._state = null), ot(this));
            }));
      }
      _waitForThePromiseToSettle(e) {
        this._state === null
          ? this._nativeOfflineAudioContext.dispatchEvent(e)
          : setTimeout(() => this._waitForThePromiseToSettle(e));
      }
    },
  bi = {
    channelCount: 2,
    channelCountMode: `max`,
    channelInterpretation: `speakers`,
    detune: 0,
    frequency: 440,
    periodicWave: void 0,
    type: `sine`,
  },
  xi = (e, t, n, r, i, a, o) =>
    class extends e {
      constructor(e, o) {
        let s = i(e),
          c = { ...bi, ...o },
          l = n(s, c),
          u = a(s),
          d = u ? r() : null,
          f = e.sampleRate / 2;
        (super(e, !1, l, d),
          (this._detune = t(this, u, l.detune, 153600, -153600)),
          (this._frequency = t(this, u, l.frequency, f, -f)),
          (this._nativeOscillatorNode = l),
          (this._onended = null),
          (this._oscillatorNodeRenderer = d),
          this._oscillatorNodeRenderer !== null &&
            c.periodicWave !== void 0 &&
            (this._oscillatorNodeRenderer.periodicWave = c.periodicWave));
      }
      get detune() {
        return this._detune;
      }
      get frequency() {
        return this._frequency;
      }
      get onended() {
        return this._onended;
      }
      set onended(e) {
        let t = typeof e == `function` ? o(this, e) : null;
        this._nativeOscillatorNode.onended = t;
        let n = this._nativeOscillatorNode.onended;
        this._onended = n !== null && n === t ? e : n;
      }
      get type() {
        return this._nativeOscillatorNode.type;
      }
      set type(e) {
        ((this._nativeOscillatorNode.type = e),
          this._oscillatorNodeRenderer !== null &&
            (this._oscillatorNodeRenderer.periodicWave = null));
      }
      setPeriodicWave(e) {
        (this._nativeOscillatorNode.setPeriodicWave(e),
          this._oscillatorNodeRenderer !== null &&
            (this._oscillatorNodeRenderer.periodicWave = e));
      }
      start(e = 0) {
        if (
          (this._nativeOscillatorNode.start(e),
          this._oscillatorNodeRenderer !== null &&
            (this._oscillatorNodeRenderer.start = e),
          this.context.state !== `closed`)
        ) {
          je(this);
          let e = () => {
            (this._nativeOscillatorNode.removeEventListener(`ended`, e),
              Je(this) && Ne(this));
          };
          this._nativeOscillatorNode.addEventListener(`ended`, e);
        }
      }
      stop(e = 0) {
        (this._nativeOscillatorNode.stop(e),
          this._oscillatorNodeRenderer !== null &&
            (this._oscillatorNodeRenderer.stop = e));
      }
    },
  Si = (e, t, n, r, i) => () => {
    let a = new WeakMap(),
      o = null,
      s = null,
      c = null,
      l = async (l, u) => {
        let d = n(l),
          f = M(d, u);
        return (
          f ||
            ((d = t(u, {
              channelCount: d.channelCount,
              channelCountMode: d.channelCountMode,
              channelInterpretation: d.channelInterpretation,
              detune: d.detune.value,
              frequency: d.frequency.value,
              periodicWave: o === null ? void 0 : o,
              type: d.type,
            })),
            s !== null && d.start(s),
            c !== null && d.stop(c)),
          a.set(u, d),
          f
            ? (await e(u, l.detune, d.detune), await e(u, l.frequency, d.frequency))
            : (await r(u, l.detune, d.detune), await r(u, l.frequency, d.frequency)),
          await i(l, u, d),
          d
        );
      };
    return {
      set periodicWave(e) {
        o = e;
      },
      set start(e) {
        s = e;
      },
      set stop(e) {
        c = e;
      },
      render(e, t) {
        let n = a.get(t);
        return n === void 0 ? l(e, t) : Promise.resolve(n);
      },
    };
  },
  Ci = {
    channelCount: 2,
    channelCountMode: `clamped-max`,
    channelInterpretation: `speakers`,
    coneInnerAngle: 360,
    coneOuterAngle: 360,
    coneOuterGain: 0,
    distanceModel: `inverse`,
    maxDistance: 1e4,
    orientationX: 1,
    orientationY: 0,
    orientationZ: 0,
    panningModel: `equalpower`,
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    refDistance: 1,
    rolloffFactor: 1,
  },
  wi = (e, t, n, r, i, a, o) =>
    class extends e {
      constructor(e, s) {
        let c = i(e),
          l = n(c, { ...Ci, ...s }),
          u = a(c),
          d = u ? r() : null;
        (super(e, !1, l, d),
          (this._nativePannerNode = l),
          (this._orientationX = t(this, u, l.orientationX, N, qe)),
          (this._orientationY = t(this, u, l.orientationY, N, qe)),
          (this._orientationZ = t(this, u, l.orientationZ, N, qe)),
          (this._positionX = t(this, u, l.positionX, N, qe)),
          (this._positionY = t(this, u, l.positionY, N, qe)),
          (this._positionZ = t(this, u, l.positionZ, N, qe)),
          o(this, 1));
      }
      get coneInnerAngle() {
        return this._nativePannerNode.coneInnerAngle;
      }
      set coneInnerAngle(e) {
        this._nativePannerNode.coneInnerAngle = e;
      }
      get coneOuterAngle() {
        return this._nativePannerNode.coneOuterAngle;
      }
      set coneOuterAngle(e) {
        this._nativePannerNode.coneOuterAngle = e;
      }
      get coneOuterGain() {
        return this._nativePannerNode.coneOuterGain;
      }
      set coneOuterGain(e) {
        this._nativePannerNode.coneOuterGain = e;
      }
      get distanceModel() {
        return this._nativePannerNode.distanceModel;
      }
      set distanceModel(e) {
        this._nativePannerNode.distanceModel = e;
      }
      get maxDistance() {
        return this._nativePannerNode.maxDistance;
      }
      set maxDistance(e) {
        this._nativePannerNode.maxDistance = e;
      }
      get orientationX() {
        return this._orientationX;
      }
      get orientationY() {
        return this._orientationY;
      }
      get orientationZ() {
        return this._orientationZ;
      }
      get panningModel() {
        return this._nativePannerNode.panningModel;
      }
      set panningModel(e) {
        this._nativePannerNode.panningModel = e;
      }
      get positionX() {
        return this._positionX;
      }
      get positionY() {
        return this._positionY;
      }
      get positionZ() {
        return this._positionZ;
      }
      get refDistance() {
        return this._nativePannerNode.refDistance;
      }
      set refDistance(e) {
        this._nativePannerNode.refDistance = e;
      }
      get rolloffFactor() {
        return this._nativePannerNode.rolloffFactor;
      }
      set rolloffFactor(e) {
        this._nativePannerNode.rolloffFactor = e;
      }
    },
  Ti = (e, t, n, r, i, a, o, s, c, l) => () => {
    let u = new WeakMap(),
      d = null,
      f = async (f, p) => {
        let m = null,
          h = a(f),
          g = {
            channelCount: h.channelCount,
            channelCountMode: h.channelCountMode,
            channelInterpretation: h.channelInterpretation,
          },
          _ = {
            ...g,
            coneInnerAngle: h.coneInnerAngle,
            coneOuterAngle: h.coneOuterAngle,
            coneOuterGain: h.coneOuterGain,
            distanceModel: h.distanceModel,
            maxDistance: h.maxDistance,
            panningModel: h.panningModel,
            refDistance: h.refDistance,
            rolloffFactor: h.rolloffFactor,
          },
          v = M(h, p);
        if (
          (`bufferSize` in h
            ? (m = r(p, { ...g, gain: 1 }))
            : v ||
              (h = i(p, {
                ..._,
                orientationX: h.orientationX.value,
                orientationY: h.orientationY.value,
                orientationZ: h.orientationZ.value,
                positionX: h.positionX.value,
                positionY: h.positionY.value,
                positionZ: h.positionZ.value,
              })),
          u.set(p, m === null ? h : m),
          m !== null)
        ) {
          if (d === null) {
            if (o === null)
              throw Error(`Missing the native OfflineAudioContext constructor.`);
            let e = new o(6, f.context.length, p.sampleRate),
              r = t(e, {
                channelCount: 1,
                channelCountMode: `explicit`,
                channelInterpretation: `speakers`,
                numberOfInputs: 6,
              });
            (r.connect(e.destination),
              (d = (async () => {
                let t = await Promise.all(
                  [
                    f.orientationX,
                    f.orientationY,
                    f.orientationZ,
                    f.positionX,
                    f.positionY,
                    f.positionZ,
                  ].map(async (t, r) => {
                    let i = n(e, {
                      channelCount: 1,
                      channelCountMode: `explicit`,
                      channelInterpretation: `discrete`,
                      offset: +(r === 0),
                    });
                    return (await s(e, t, i.offset), i);
                  }),
                );
                for (let e = 0; e < 6; e += 1) (t[e].connect(r, 0, e), t[e].start(0));
                return l(e);
              })()));
          }
          let e = await d,
            a = r(p, { ...g, gain: 1 });
          await c(f, p, a);
          let u = [];
          for (let t = 0; t < e.numberOfChannels; t += 1) u.push(e.getChannelData(t));
          let h = [u[0][0], u[1][0], u[2][0]],
            v = [u[3][0], u[4][0], u[5][0]],
            y = r(p, { ...g, gain: 1 }),
            b = i(p, {
              ..._,
              orientationX: h[0],
              orientationY: h[1],
              orientationZ: h[2],
              positionX: v[0],
              positionY: v[1],
              positionZ: v[2],
            });
          (a.connect(y).connect(b.inputs[0]), b.connect(m));
          for (let t = 128; t < e.length; t += 128) {
            let e = [u[0][t], u[1][t], u[2][t]],
              n = [u[3][t], u[4][t], u[5][t]];
            if (e.some((e, t) => e !== h[t]) || n.some((e, t) => e !== v[t])) {
              ((h = e), (v = n));
              let o = t / p.sampleRate;
              (y.gain.setValueAtTime(0, o),
                (y = r(p, { ...g, gain: 0 })),
                (b = i(p, {
                  ..._,
                  orientationX: h[0],
                  orientationY: h[1],
                  orientationZ: h[2],
                  positionX: v[0],
                  positionY: v[1],
                  positionZ: v[2],
                })),
                y.gain.setValueAtTime(1, o),
                a.connect(y).connect(b.inputs[0]),
                b.connect(m));
            }
          }
          return m;
        }
        return (
          v
            ? (await e(p, f.orientationX, h.orientationX),
              await e(p, f.orientationY, h.orientationY),
              await e(p, f.orientationZ, h.orientationZ),
              await e(p, f.positionX, h.positionX),
              await e(p, f.positionY, h.positionY),
              await e(p, f.positionZ, h.positionZ))
            : (await s(p, f.orientationX, h.orientationX),
              await s(p, f.orientationY, h.orientationY),
              await s(p, f.orientationZ, h.orientationZ),
              await s(p, f.positionX, h.positionX),
              await s(p, f.positionY, h.positionY),
              await s(p, f.positionZ, h.positionZ)),
          _t(h) ? await c(f, p, h.inputs[0]) : await c(f, p, h),
          h
        );
      };
    return {
      render(e, t) {
        let n = u.get(t);
        return n === void 0 ? f(e, t) : Promise.resolve(n);
      },
    };
  },
  Ei = { disableNormalization: !1 },
  Di = (e, t, n, r) =>
    class i {
      constructor(i, a) {
        let o = e(t(i), r({ ...Ei, ...a }));
        return (n.add(o), o);
      }
      static [Symbol.hasInstance](e) {
        return (
          (typeof e == `object` && !!e && Object.getPrototypeOf(e) === i.prototype) ||
          n.has(e)
        );
      }
    },
  Oi = (e, t) => (n, r, i) => (e(r).replay(i), t(r, n, i)),
  ki = (e, t, n) => async (r, i, a) => {
    let o = e(r);
    await Promise.all(
      o.activeInputs
        .map((e, o) =>
          Array.from(e).map(async ([e, s]) => {
            let c = await t(e).render(e, i),
              l = r.context.destination;
            !n(e) && (r !== l || !n(r)) && c.connect(a, s, o);
          }),
        )
        .reduce((e, t) => [...e, ...t], []),
    );
  },
  Ai = (e, t, n) => async (r, i, a) => {
    let o = t(r);
    await Promise.all(
      Array.from(o.activeInputs).map(async ([t, r]) => {
        let o = await e(t).render(t, i);
        n(t) || o.connect(a, r);
      }),
    );
  },
  ji = (e, t, n, r) => (i) =>
    e(Sr, () => Sr(i))
      ? Promise.resolve(e(r, r)).then((e) => {
          if (!e) {
            let e = n(i, 512, 0, 1);
            ((i.oncomplete = () => {
              ((e.onaudioprocess = null), e.disconnect());
            }),
              (e.onaudioprocess = () => i.currentTime),
              e.connect(i.destination));
          }
          return i.startRendering();
        })
      : new Promise((e) => {
          let n = t(i, {
            channelCount: 1,
            channelCountMode: `explicit`,
            channelInterpretation: `discrete`,
            gain: 0,
          });
          ((i.oncomplete = (t) => {
            (n.disconnect(), e(t.renderedBuffer));
          }),
            n.connect(i.destination),
            i.startRendering());
        }),
  Mi = (e) => (t, n) => {
    e.set(t, n);
  },
  Ni = (e) => (t, n) => e.set(t, n),
  Pi = (e, t, n, r, i, a, o, s) => (c, l) =>
    n(c)
      .render(c, l)
      .then(() => Promise.all(Array.from(r(l)).map((e) => n(e).render(e, l))))
      .then(() => i(l))
      .then(
        (n) => (
          typeof n.copyFromChannel == `function`
            ? t(a, () => a(n)) || s(n)
            : (o(n), We(n)),
          e.add(n),
          n
        ),
      ),
  Fi = {
    channelCount: 2,
    channelCountMode: `explicit`,
    channelInterpretation: `speakers`,
    pan: 0,
  },
  Ii = (e, t, n, r, i, a) =>
    class extends e {
      constructor(e, o) {
        let s = i(e),
          c = n(s, { ...Fi, ...o }),
          l = a(s),
          u = l ? r() : null;
        (super(e, !1, c, u), (this._pan = t(this, l, c.pan)));
      }
      get pan() {
        return this._pan;
      }
    },
  Li = (e, t, n, r, i) => () => {
    let a = new WeakMap(),
      o = async (o, s) => {
        let c = n(o),
          l = M(c, s);
        return (
          l ||
            (c = t(s, {
              channelCount: c.channelCount,
              channelCountMode: c.channelCountMode,
              channelInterpretation: c.channelInterpretation,
              pan: c.pan.value,
            })),
          a.set(s, c),
          l ? await e(s, o.pan, c.pan) : await r(s, o.pan, c.pan),
          _t(c) ? await i(o, s, c.inputs[0]) : await i(o, s, c),
          c
        );
      };
    return {
      render(e, t) {
        let n = a.get(t);
        return n === void 0 ? o(e, t) : Promise.resolve(n);
      },
    };
  },
  Ri = (e) => () => {
    if (e === null) return !1;
    try {
      new e({ length: 1, sampleRate: 44100 });
    } catch {
      return !1;
    }
    return !0;
  },
  zi = (e, t) => async () => {
    if (e === null) return !0;
    if (t === null) return !1;
    let n = new Blob(
        [
          `class A extends AudioWorkletProcessor{process(i){this.port.postMessage(i,[i[0][0].buffer])}}registerProcessor("a",A)`,
        ],
        { type: `application/javascript; charset=utf-8` },
      ),
      r = new t(1, 128, 44100),
      i = URL.createObjectURL(n),
      a = !1,
      o = !1;
    try {
      await r.audioWorklet.addModule(i);
      let t = new e(r, `a`, { numberOfOutputs: 0 }),
        n = r.createOscillator();
      ((t.port.onmessage = () => (a = !0)),
        (t.onprocessorerror = () => (o = !0)),
        n.connect(t),
        n.start(0),
        await r.startRendering(),
        await new Promise((e) => setTimeout(e)));
    } catch {
    } finally {
      URL.revokeObjectURL(i);
    }
    return a && !o;
  },
  Bi = (e, t) => () => {
    if (t === null) return Promise.resolve(!1);
    let n = new t(1, 1, 44100),
      r = e(n, {
        channelCount: 1,
        channelCountMode: `explicit`,
        channelInterpretation: `discrete`,
        gain: 0,
      });
    return new Promise((e) => {
      ((n.oncomplete = () => {
        (r.disconnect(), e(n.currentTime !== 0));
      }),
        n.startRendering());
    });
  },
  Vi = () => new DOMException(``, `UnknownError`),
  Hi = {
    channelCount: 2,
    channelCountMode: `max`,
    channelInterpretation: `speakers`,
    curve: null,
    oversample: `none`,
  },
  Ui = (e, t, n, r, i, a, o) =>
    class extends e {
      constructor(e, t) {
        let s = i(e),
          c = n(s, { ...Hi, ...t }),
          l = a(s) ? r() : null;
        (super(e, !0, c, l),
          (this._isCurveNullified = !1),
          (this._nativeWaveShaperNode = c),
          o(this, 1));
      }
      get curve() {
        return this._isCurveNullified ? null : this._nativeWaveShaperNode.curve;
      }
      set curve(e) {
        if (e === null)
          ((this._isCurveNullified = !0),
            (this._nativeWaveShaperNode.curve = new Float32Array([0, 0])));
        else {
          if (e.length < 2) throw t();
          ((this._isCurveNullified = !1), (this._nativeWaveShaperNode.curve = e));
        }
      }
      get oversample() {
        return this._nativeWaveShaperNode.oversample;
      }
      set oversample(e) {
        this._nativeWaveShaperNode.oversample = e;
      }
    },
  Wi = (e, t, n) => () => {
    let r = new WeakMap(),
      i = async (i, a) => {
        let o = t(i);
        return (
          M(o, a) ||
            (o = e(a, {
              channelCount: o.channelCount,
              channelCountMode: o.channelCountMode,
              channelInterpretation: o.channelInterpretation,
              curve: o.curve,
              oversample: o.oversample,
            })),
          r.set(a, o),
          _t(o) ? await n(i, a, o.inputs[0]) : await n(i, a, o),
          o
        );
      };
    return {
      render(e, t) {
        let n = r.get(t);
        return n === void 0 ? i(e, t) : Promise.resolve(n);
      },
    };
  },
  Gi = () => (typeof window > `u` ? null : window),
  Ki = (e, t) => (n) => {
    ((n.copyFromChannel = (r, i, a = 0) => {
      let o = e(a),
        s = e(i);
      if (s >= n.numberOfChannels) throw t();
      let c = n.length,
        l = n.getChannelData(s),
        u = r.length;
      for (let e = o < 0 ? -o : 0; e + o < c && e < u; e += 1) r[e] = l[e + o];
    }),
      (n.copyToChannel = (r, i, a = 0) => {
        let o = e(a),
          s = e(i);
        if (s >= n.numberOfChannels) throw t();
        let c = n.length,
          l = n.getChannelData(s),
          u = r.length;
        for (let e = o < 0 ? -o : 0; e + o < c && e < u; e += 1) l[e + o] = r[e];
      }));
  },
  qi = (e) => (t) => {
    ((t.copyFromChannel = (
      (n) =>
      (r, i, a = 0) => {
        let o = e(a),
          s = e(i);
        if (o < t.length) return n.call(t, r, s, o);
      }
    )(t.copyFromChannel)),
      (t.copyToChannel = (
        (n) =>
        (r, i, a = 0) => {
          let o = e(a),
            s = e(i);
          if (o < t.length) return n.call(t, r, s, o);
        }
      )(t.copyToChannel)));
  },
  Ji = (e) => (t, n) => {
    let r = n.createBuffer(1, 1, 44100);
    (t.buffer === null && (t.buffer = r),
      e(
        t,
        `buffer`,
        (e) => () => {
          let n = e.call(t);
          return n === r ? null : n;
        },
        (e) => (n) => e.call(t, n === null ? r : n),
      ));
  },
  Yi = (e, t) => (n, r) => {
    ((r.channelCount = 1),
      (r.channelCountMode = `explicit`),
      Object.defineProperty(r, 'channelCount', {
        get: () => 1,
        set: () => {
          throw e();
        },
      }),
      Object.defineProperty(r, 'channelCountMode', {
        get: () => `explicit`,
        set: () => {
          throw e();
        },
      }));
    let i = n.createBufferSource();
    t(
      r,
      () => {
        let e = r.numberOfInputs;
        for (let t = 0; t < e; t += 1) i.connect(r, 0, t);
      },
      () => i.disconnect(r),
    );
  },
  Xi = (e, t, n) =>
    e.copyFromChannel === void 0
      ? e.getChannelData(n)[0]
      : (e.copyFromChannel(t, n), t[0]),
  Zi = (e) => {
    if (e === null) return !1;
    let t = e.length;
    return t % 2 == 0 ? e[t / 2 - 1] + e[t / 2] !== 0 : e[Math.floor(t / 2)] !== 0;
  },
  Qi = (e, t, n, r) => {
    let i = e;
    for (; !i.hasOwnProperty(t);) i = Object.getPrototypeOf(i);
    let { get: a, set: o } = Object.getOwnPropertyDescriptor(i, t);
    Object.defineProperty(e, t, { get: n(a), set: r(o) });
  },
  $i = (e) => ({
    ...e,
    outputChannelCount:
      e.outputChannelCount === void 0
        ? e.numberOfInputs === 1 && e.numberOfOutputs === 1
          ? [e.channelCount]
          : Array.from({ length: e.numberOfOutputs }, () => 1)
        : e.outputChannelCount,
  }),
  ea = (e) => ({ ...e, channelCount: e.numberOfOutputs }),
  ta = (e) => {
    let { imag: t, real: n } = e;
    return t === void 0
      ? n === void 0
        ? { ...e, imag: [0, 0], real: [0, 0] }
        : { ...e, imag: Array.from(n, () => 0), real: n }
      : n === void 0
        ? { ...e, imag: t, real: Array.from(t, () => 0) }
        : { ...e, imag: t, real: n };
  },
  na = (e, t, n) => {
    try {
      e.setValueAtTime(t, n);
    } catch (r) {
      if (r.code !== 9) throw r;
      na(e, t, n + 1e-7);
    }
  },
  ra = (e) => {
    let t = e.createBufferSource();
    t.start();
    try {
      t.start();
    } catch {
      return !0;
    }
    return !1;
  },
  ia = (e) => {
    let t = e.createBufferSource();
    t.buffer = e.createBuffer(1, 1, 44100);
    try {
      t.start(0, 1);
    } catch {
      return !1;
    }
    return !0;
  },
  aa = (e) => {
    let t = e.createBufferSource();
    t.start();
    try {
      t.stop();
    } catch {
      return !1;
    }
    return !0;
  },
  oa = (e) => {
    let t = e.createOscillator();
    try {
      t.start(-1);
    } catch (e) {
      return e instanceof RangeError;
    }
    return !1;
  },
  sa = (e) => {
    let t = e.createBuffer(1, 1, 44100),
      n = e.createBufferSource();
    ((n.buffer = t), n.start(), n.stop());
    try {
      return (n.stop(), !0);
    } catch {
      return !1;
    }
  },
  ca = (e) => {
    let t = e.createOscillator();
    try {
      t.stop(-1);
    } catch (e) {
      return e instanceof RangeError;
    }
    return !1;
  },
  la = (e) => {
    let { port1: t, port2: n } = new MessageChannel();
    try {
      t.postMessage(e);
    } finally {
      (t.close(), n.close());
    }
  },
  ua = (e) => {
    e.start = (
      (t) =>
      (n = 0, r = 0, i) => {
        let a = e.buffer,
          o = a === null ? r : Math.min(a.duration, r);
        a !== null && o > a.duration - 0.5 / e.context.sampleRate
          ? t.call(e, n, 0, 0)
          : t.call(e, n, o, i);
      }
    )(e.start);
  },
  da = (e, t) => {
    let n = t.createGain();
    e.connect(n);
    let r = ((t) => () => {
      (t.call(e, n), e.removeEventListener(`ended`, r));
    })(e.disconnect);
    (e.addEventListener(`ended`, r),
      qr(e, n),
      (e.stop = ((t) => {
        let r = !1;
        return (i = 0) => {
          if (r)
            try {
              t.call(e, i);
            } catch {
              n.gain.setValueAtTime(0, i);
            }
          else (t.call(e, i), (r = !0));
        };
      })(e.stop)));
  },
  fa = (e, t) => (n) => {
    let r = { value: e };
    return (
      Object.defineProperties(n, { currentTarget: r, target: r }),
      typeof t == `function` ? t.call(e, n) : t.handleEvent.call(e, n)
    );
  },
  pa = ce(mt),
  ma = Ie(mt),
  ha = Dn(Oe),
  ga = new WeakMap(),
  _a = Kn(ga),
  va = tn(new Map(), new WeakMap()),
  ya = Gi(),
  ba = Er(va, Ue),
  xa = Gn(P),
  V = ki(P, xa, Tt),
  Sa = Ve(ba, F, V),
  H = Yn(he),
  Ca = ci(ya),
  U = mr(Ca),
  wa = new WeakMap(),
  Ta = Rn(fa),
  Ea = Mr(ya),
  Da = ur(Ea),
  Oa = dr(ya),
  ka = fr(ya),
  Aa = Pr(ya),
  W = zt(
    le(de),
    Fe(pa, ma, vt, ha, Ct, P, _a, Ae, F, mt, Je, Tt, Et),
    va,
    ar(_e, Ct, P, F, wt, Je),
    Ue,
    Qn,
    B,
    Cn(vt, _e, P, F, wt, H, Je, U),
    An(wa, P, De),
    Ta,
    H,
    Da,
    Oa,
    ka,
    U,
    Aa,
  ),
  ja = Be(W, Sa, Ue, ba, H, U),
  Ma = new WeakSet(),
  Na = Dr(ya),
  Pa = hn(new Uint32Array(1)),
  Fa = Ki(Pa, Ue),
  Ia = qi(Pa),
  La = Ke(Ma, va, B, Na, Ca, Ri(Na), Fa, Ia),
  Ra = Le(Qr),
  za = Ai(xa, it, Tt),
  Ba = ln(za),
  Va = jr(Ra, va, ra, ia, aa, oa, sa, ca, ua, Ji(Qi), da),
  Ha = Oi(qn(it), za),
  Ua = Ze(Ba, Va, F, Ha, V),
  Wa = Bt(
    j(pe),
    wa,
    me,
    Vt,
    A.createCancelAndHoldAutomationEvent,
    A.createCancelScheduledValuesAutomationEvent,
    A.createExponentialRampToValueAutomationEvent,
    A.createLinearRampToValueAutomationEvent,
    A.createSetTargetAutomationEvent,
    A.createSetValueAutomationEvent,
    A.createSetValueCurveAutomationEvent,
    Ea,
    na,
  ),
  Ga = Xe(W, Ua, Wa, I, Va, H, U, fa),
  Ka = lt(W, ut, Ue, I, Nr(Qr, Qi), H, U, V),
  qa = en(Ba, Hr, F, Ha, V),
  Ja = Ni(ga),
  Ya = $t(W, Wa, qa, Qn, Hr, H, U, Ja),
  Xa = Cr(mt, Oa),
  Za = Ur(Ea, Yi(I, Xa)),
  Qa = rn(W, an(Za, F, V), Za, H, U),
  $a = sn(W, cn(Gr, F, V), Gr, H, U, ea),
  eo = Kr(Ra, va, Jr(Ra, Va, Qr, Xa), oa, ca),
  to = pn(W, Wa, mn(Ba, eo, F, Ha, V), eo, H, U, fa),
  no = Yr(B, Qi),
  ro = _n(W, vn(no, F, V), no, H, U, Ja),
  io = Tn(W, Wa, En(Ba, Xr, F, Ha, V), Xr, H, U, Ja),
  ao = Zr(B),
  oo = Pn(W, Wa, Fn(Ba, ao, F, Ha, V), ao, B, H, U, Ja),
  so = Hn(W, Wa, Un(Ba, Qr, F, Ha, V), Qr, H, U),
  co = ri(Qn, I, pi, B),
  lo = ji(va, Qr, pi, Bi(Qr, Ca)),
  uo = ir(Va, F, Ca, V, lo),
  fo = tr(W, $r(co), uo, H, U, Ja),
  po = dt(Wa, Za, eo, pi, B, Xi, U, Qi),
  mo = new WeakMap(),
  ho = xr(Ka, po, Ta, U, mo, fa),
  go = li(Ra, va, oa, sa, ca, da),
  _o = xi(W, Wa, go, Si(Ba, go, F, Ha, V), H, U, fa),
  vo = dn(Va),
  yo = gi(vo, I, _i(vo, I, Qr, Zi, Xa), Zi, Xa, Ea, Qi),
  bo = ui(di(vt, I, Za, Qr, pi, yo, B, Ct, Xi, Xa)),
  xo = wi(W, Wa, bo, Ti(Ba, Za, eo, Qr, bo, F, Ca, Ha, V, lo), H, U, Ja),
  So = Di(fi(Ue), H, new WeakSet(), ta),
  Co = mi(hi(Za, Gr, Qr, yo, B, Xa), B),
  wo = Ii(W, Wa, Co, Li(Ba, Co, F, Ha, V), H, U),
  To = Ui(W, I, yo, Wi(yo, F, V), H, U, Ja),
  Eo = hr(ya),
  Do = zn(ya),
  Oo = new WeakMap(),
  ko = Xn(Oo, Ca),
  Ao = Eo
    ? Ee(
        va,
        B,
        Ln(ya),
        Do,
        Bn(se),
        H,
        ko,
        U,
        Aa,
        new WeakMap(),
        new WeakMap(),
        zi(Aa, Ca),
        ya,
      )
    : void 0,
  jo = pr(Da, U),
  Mo = Zt(
    Ao,
    ja,
    La,
    Ga,
    Ya,
    Qa,
    $a,
    to,
    ro,
    Sn(Ma, va, bn, In, new WeakSet(), H, jo, He, Sr, Fa, Ia),
    io,
    oo,
    so,
    fo,
    ho,
    _o,
    xo,
    So,
    wo,
    To,
  ),
  No = ct(
    Mo,
    I,
    B,
    Vi,
    gr(W, ii, H, U),
    vr(W, ai, H, U),
    yr(W, oi, H, U),
    br(W, si(I, U), H),
    Ea,
  ),
  Po = Zn(mo),
  Fo = Re(Po),
  Io = un(Ue),
  Lo = On(Po),
  Ro = Mn(Ue),
  zo = new WeakMap(),
  Bo = Ir(I, Vr(Io, Ue, I, Za, Gr, eo, Qr, pi, B, Ro, Do, Wn(zo, De), Xa), Qr, B, Xa),
  Vo = Xt(Ba, Io, Va, Za, Gr, eo, Qr, Lo, Ro, Do, F, Aa, Ca, Ha, V, lo),
  Ho = Jn(Oo),
  Uo = Mi(zo),
  Wo = Eo ? Wt(Fo, W, Wa, Vo, Bo, P, Ho, H, U, Aa, $i, Uo, la, fa) : void 0,
  Go = yi(Mo, va, I, yn(B, Ca), Pi(Ma, va, xa, Po, lo, He, Fa, Ia)),
  Ko = or(he, Da),
  qo = sr(fe, Oa),
  Jo = cr(me, ka),
  Yo = lr(he, U);
function Xo(e) {
  return e === void 0;
}
function G(e) {
  return e !== void 0;
}
function Zo(e) {
  return typeof e == `function`;
}
function Qo(e) {
  return typeof e == `number`;
}
function $o(e) {
  return (
    Object.prototype.toString.call(e) === `[object Object]` && e.constructor === Object
  );
}
function es(e) {
  return typeof e == `boolean`;
}
function ts(e) {
  return Array.isArray(e);
}
function ns(e) {
  return typeof e == `string`;
}
function rs(e) {
  return ns(e) && /^([a-g]{1}(?:b|#|x|bb)?)(-?[0-9]+)/i.test(e);
}
function K(e, t) {
  if (!e) throw Error(t);
}
function is(e, t, n = 1 / 0) {
  if (!(t <= e && e <= n))
    throw RangeError(`Value must be within [${t}, ${n}], got: ${e}`);
}
function as(e) {
  !e.isOffline &&
    e.state !== `running` &&
    fs(
      `The AudioContext is "suspended". Invoke Tone.start() from a user action to start the audio.`,
    );
}
var os = !1,
  ss = !1;
function cs(e) {
  os = e;
}
function ls(e) {
  Xo(e) &&
    os &&
    !ss &&
    ((ss = !0),
    fs(
      `Events scheduled inside of scheduled callbacks should use the passed in scheduling time. See https://github.com/Tonejs/Tone.js/wiki/Accurate-Timing`,
    ));
}
var us = console;
function ds(...e) {
  us.log(...e);
}
function fs(...e) {
  us.warn(...e);
}
function ps(e) {
  return new No(e);
}
function ms(e, t, n) {
  return new Go(e, t, n);
}
var hs = typeof self == `object` ? self : null,
  gs =
    hs && (hs.hasOwnProperty(`AudioContext`) || hs.hasOwnProperty(`webkitAudioContext`));
function _s(e, t, n) {
  return (
    K(G(Wo), `AudioWorkletNode only works in a secure context (https or localhost)`),
    new (e instanceof hs?.BaseAudioContext ? hs?.AudioWorkletNode : Wo)(e, t, n)
  );
}
function vs(e, t, n, r) {
  var i = arguments.length,
    a = i < 3 ? t : r === null ? (r = Object.getOwnPropertyDescriptor(t, n)) : r,
    o;
  if (typeof Reflect == `object` && typeof Reflect.decorate == `function`)
    a = Reflect.decorate(e, t, n, r);
  else
    for (var s = e.length - 1; s >= 0; s--)
      (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
  return (i > 3 && a && Object.defineProperty(t, n, a), a);
}
function q(e, t, n, r) {
  function i(e) {
    return e instanceof n
      ? e
      : new n(function (t) {
          t(e);
        });
  }
  return new (n ||= Promise)(function (n, a) {
    function o(e) {
      try {
        c(r.next(e));
      } catch (e) {
        a(e);
      }
    }
    function s(e) {
      try {
        c(r.throw(e));
      } catch (e) {
        a(e);
      }
    }
    function c(e) {
      e.done ? n(e.value) : i(e.value).then(o, s);
    }
    c((r = r.apply(e, t || [])).next());
  });
}
var ys = class {
  constructor(e, t, n, r) {
    ((this._callback = e),
      (this._type = t),
      (this._minimumUpdateInterval = Math.max(128 / (r || 44100), 0.001)),
      (this.updateInterval = n),
      this._createClock());
  }
  _createWorker() {
    let e = new Blob(
        [
          `
			// the initial timeout time
			let timeoutTime =  ${(this._updateInterval * 1e3).toFixed(1)};
			// onmessage callback
			self.onmessage = function(msg){
				timeoutTime = parseInt(msg.data);
			};
			// the tick function which posts a message
			// and schedules a new tick
			function tick(){
				setTimeout(tick, timeoutTime);
				self.postMessage('tick');
			}
			// call tick initially
			tick();
			`,
        ],
        { type: `text/javascript` },
      ),
      t = URL.createObjectURL(e),
      n = new Worker(t);
    ((n.onmessage = this._callback.bind(this)), (this._worker = n));
  }
  _createTimeout() {
    this._timeout = setTimeout(() => {
      (this._createTimeout(), this._callback());
    }, this._updateInterval * 1e3);
  }
  _createClock() {
    if (this._type === `worker`)
      try {
        this._createWorker();
      } catch {
        ((this._type = `timeout`), this._createClock());
      }
    else this._type === `timeout` && this._createTimeout();
  }
  _disposeClock() {
    (this._timeout && clearTimeout(this._timeout),
      this._worker && (this._worker.terminate(), (this._worker.onmessage = null)));
  }
  get updateInterval() {
    return this._updateInterval;
  }
  set updateInterval(e) {
    var t;
    ((this._updateInterval = Math.max(e, this._minimumUpdateInterval)),
      this._type === `worker` &&
        ((t = this._worker) == null || t.postMessage(this._updateInterval * 1e3)));
  }
  get type() {
    return this._type;
  }
  set type(e) {
    (this._disposeClock(), (this._type = e), this._createClock());
  }
  dispose() {
    this._disposeClock();
  }
};
function bs(e) {
  return Jo(e);
}
function xs(e) {
  return qo(e);
}
function Ss(e) {
  return Yo(e);
}
function Cs(e) {
  return Ko(e);
}
function ws(e) {
  return e instanceof La;
}
function Ts(e, t) {
  return e === `value` || bs(t) || xs(t) || ws(t);
}
function Es(e, ...t) {
  if (!t.length) return e;
  let n = t.shift();
  if ($o(e) && $o(n))
    for (let t in n)
      Ts(t, n[t])
        ? (e[t] = n[t])
        : $o(n[t])
          ? (e[t] || Object.assign(e, { [t]: {} }), Es(e[t], n[t]))
          : Object.assign(e, { [t]: n[t] });
  return Es(e, ...t);
}
function Ds(e, t) {
  return e.length === t.length && e.every((e, n) => t[n] === e);
}
function J(e, t, n = [], r) {
  let i = {},
    a = Array.from(t);
  if (
    ($o(a[0]) &&
      r &&
      !Reflect.has(a[0], r) &&
      (Object.keys(a[0]).some((t) => Reflect.has(e, t)) ||
        (Es(i, { [r]: a[0] }), n.splice(n.indexOf(r), 1), a.shift())),
    a.length === 1 && $o(a[0]))
  )
    Es(i, a[0]);
  else for (let e = 0; e < n.length; e++) G(a[e]) && (i[n[e]] = a[e]);
  return Es(e, i);
}
function Os(e) {
  return e.constructor.getDefaults();
}
function ks(e, t) {
  return Xo(e) ? t : e;
}
function As(e, t) {
  return (
    t.forEach((t) => {
      Reflect.has(e, t) && delete e[t];
    }),
    e
  );
}
var js = class {
  constructor() {
    ((this.debug = !1), (this._wasDisposed = !1));
  }
  static getDefaults() {
    return {};
  }
  log(...e) {
    (this.debug || (hs && this.toString() === hs.TONE_DEBUG_CLASS)) && ds(this, ...e);
  }
  dispose() {
    return ((this._wasDisposed = !0), this);
  }
  get disposed() {
    return this._wasDisposed;
  }
  toString() {
    return this.name;
  }
};
js.version = T;
var Ms = 1e-6;
function Ns(e, t) {
  return e > t + Ms;
}
function Ps(e, t) {
  return Ns(e, t) || Is(e, t);
}
function Fs(e, t) {
  return e + Ms < t;
}
function Is(e, t) {
  return Math.abs(e - t) < Ms;
}
function Ls(e, t, n) {
  return Math.max(Math.min(e, n), t);
}
var Rs = class e extends js {
    constructor() {
      (super(), (this.name = `Timeline`), (this._timeline = []));
      let t = J(e.getDefaults(), arguments, [`memory`]);
      ((this.memory = t.memory), (this.increasing = t.increasing));
    }
    static getDefaults() {
      return { memory: 1 / 0, increasing: !1 };
    }
    get length() {
      return this._timeline.length;
    }
    add(e) {
      if (
        (K(Reflect.has(e, `time`), `Timeline: events must have a time attribute`),
        (e.time = e.time.valueOf()),
        this.increasing && this.length)
      ) {
        let t = this._timeline[this.length - 1];
        (K(
          Ps(e.time, t.time),
          `The time must be greater than or equal to the last scheduled time`,
        ),
          this._timeline.push(e));
      } else {
        let t = this._search(e.time);
        this._timeline.splice(t + 1, 0, e);
      }
      if (this.length > this.memory) {
        let e = this.length - this.memory;
        this._timeline.splice(0, e);
      }
      return this;
    }
    remove(e) {
      let t = this._timeline.indexOf(e);
      return (t !== -1 && this._timeline.splice(t, 1), this);
    }
    get(e, t = `time`) {
      let n = this._search(e, t);
      return n === -1 ? null : this._timeline[n];
    }
    peek() {
      return this._timeline[0];
    }
    shift() {
      return this._timeline.shift();
    }
    getAfter(e, t = `time`) {
      let n = this._search(e, t);
      return n + 1 < this._timeline.length ? this._timeline[n + 1] : null;
    }
    getBefore(e) {
      let t = this._timeline.length;
      if (t > 0 && this._timeline[t - 1].time < e) return this._timeline[t - 1];
      let n = this._search(e);
      return n - 1 >= 0 ? this._timeline[n - 1] : null;
    }
    cancel(e) {
      if (this._timeline.length > 1) {
        let t = this._search(e);
        if (t >= 0)
          if (Is(this._timeline[t].time, e)) {
            for (let n = t; n >= 0 && Is(this._timeline[n].time, e); n--) t = n;
            this._timeline = this._timeline.slice(0, t);
          } else this._timeline = this._timeline.slice(0, t + 1);
        else this._timeline = [];
      } else
        this._timeline.length === 1 &&
          Ps(this._timeline[0].time, e) &&
          (this._timeline = []);
      return this;
    }
    cancelBefore(e) {
      let t = this._search(e);
      return (t >= 0 && (this._timeline = this._timeline.slice(t + 1)), this);
    }
    previousEvent(e) {
      let t = this._timeline.indexOf(e);
      return t > 0 ? this._timeline[t - 1] : null;
    }
    _search(e, t = `time`) {
      if (this._timeline.length === 0) return -1;
      let n = 0,
        r = this._timeline.length,
        i = r;
      if (r > 0 && this._timeline[r - 1][t] <= e) return r - 1;
      for (; n < i;) {
        let r = Math.floor(n + (i - n) / 2),
          a = this._timeline[r],
          o = this._timeline[r + 1];
        if (Is(a[t], e)) {
          for (let n = r; n < this._timeline.length; n++) {
            let i = this._timeline[n];
            if (Is(i[t], e)) r = n;
            else break;
          }
          return r;
        } else if (Fs(a[t], e) && Ns(o[t], e)) return r;
        else Ns(a[t], e) ? (i = r) : (n = r + 1);
      }
      return -1;
    }
    _iterate(e, t = 0, n = this._timeline.length - 1) {
      this._timeline.slice(t, n + 1).forEach(e);
    }
    forEach(e) {
      return (this._iterate(e), this);
    }
    forEachBefore(e, t) {
      let n = this._search(e);
      return (n !== -1 && this._iterate(t, 0, n), this);
    }
    forEachAfter(e, t) {
      let n = this._search(e);
      return (this._iterate(t, n + 1), this);
    }
    forEachBetween(e, t, n) {
      let r = this._search(e),
        i = this._search(t);
      return (
        r !== -1 && i !== -1
          ? (this._timeline[r].time !== e && (r += 1),
            this._timeline[i].time === t && --i,
            this._iterate(n, r, i))
          : r === -1 && this._iterate(n, 0, i),
        this
      );
    }
    forEachFrom(e, t) {
      let n = this._search(e);
      for (; n >= 0 && this._timeline[n].time >= e;) n--;
      return (this._iterate(t, n + 1), this);
    }
    forEachAtTime(e, t) {
      let n = this._search(e);
      if (n !== -1 && Is(this._timeline[n].time, e)) {
        let r = n;
        for (let t = n; t >= 0 && Is(this._timeline[t].time, e); t--) r = t;
        this._iterate(
          (e) => {
            t(e);
          },
          r,
          n,
        );
      }
      return this;
    }
    dispose() {
      return (super.dispose(), (this._timeline = []), this);
    }
  },
  zs = [];
function Bs(e) {
  zs.push(e);
}
function Vs(e) {
  zs.forEach((t) => t(e));
}
var Hs = [];
function Us(e) {
  Hs.push(e);
}
function Ws(e) {
  Hs.forEach((t) => t(e));
}
var Gs = class e extends js {
    constructor() {
      (super(...arguments), (this.name = `Emitter`));
    }
    on(e, t) {
      return (
        e.split(/\W+/).forEach((e) => {
          (Xo(this._events) && (this._events = {}),
            this._events.hasOwnProperty(e) || (this._events[e] = []),
            this._events[e].push(t));
        }),
        this
      );
    }
    once(e, t) {
      let n = (...r) => {
        (t(...r), this.off(e, n));
      };
      return (this.on(e, n), this);
    }
    off(e, t) {
      return (
        e.split(/\W+/).forEach((e) => {
          if ((Xo(this._events) && (this._events = {}), this._events.hasOwnProperty(e)))
            if (Xo(t)) this._events[e] = [];
            else {
              let n = this._events[e];
              for (let e = n.length - 1; e >= 0; e--) n[e] === t && n.splice(e, 1);
            }
        }),
        this
      );
    }
    emit(e, ...t) {
      if (this._events && this._events.hasOwnProperty(e)) {
        let n = this._events[e].slice(0);
        for (let e = 0, r = n.length; e < r; e++) n[e].apply(this, t);
      }
      return this;
    }
    static mixin(t) {
      [`on`, `once`, `off`, `emit`].forEach((n) => {
        let r = Object.getOwnPropertyDescriptor(e.prototype, n);
        Object.defineProperty(t.prototype, n, r);
      });
    }
    dispose() {
      return (super.dispose(), (this._events = void 0), this);
    }
  },
  Ks = class extends Gs {
    constructor() {
      (super(...arguments), (this.isOffline = !1));
    }
    toJSON() {
      return {};
    }
  },
  qs = class e extends Ks {
    constructor() {
      (super(),
        (this.name = `Context`),
        (this._constants = new Map()),
        (this._timeouts = new Rs()),
        (this._timeoutIds = 0),
        (this._initialized = !1),
        (this._closeStarted = !1),
        (this.isOffline = !1),
        (this._workletPromise = null));
      let t = J(e.getDefaults(), arguments, [`context`]);
      (t.context
        ? ((this._context = t.context),
          (this._latencyHint = arguments[0]?.latencyHint || ``))
        : ((this._context = ps({ latencyHint: t.latencyHint })),
          (this._latencyHint = t.latencyHint)),
        (this._ticker = new ys(
          this.emit.bind(this, `tick`),
          t.clockSource,
          t.updateInterval,
          this._context.sampleRate,
        )),
        this.on(`tick`, this._timeoutLoop.bind(this)),
        (this._context.onstatechange = () => {
          this.emit(`statechange`, this.state);
        }),
        (this[
          arguments[0]?.hasOwnProperty(`updateInterval`) ? `_lookAhead` : `lookAhead`
        ] = t.lookAhead));
    }
    static getDefaults() {
      return {
        clockSource: `worker`,
        latencyHint: `interactive`,
        lookAhead: 0.1,
        updateInterval: 0.05,
      };
    }
    initialize() {
      return ((this._initialized ||= (Vs(this), !0)), this);
    }
    createAnalyser() {
      return this._context.createAnalyser();
    }
    createOscillator() {
      return this._context.createOscillator();
    }
    createBufferSource() {
      return this._context.createBufferSource();
    }
    createBiquadFilter() {
      return this._context.createBiquadFilter();
    }
    createBuffer(e, t, n) {
      return this._context.createBuffer(e, t, n);
    }
    createChannelMerger(e) {
      return this._context.createChannelMerger(e);
    }
    createChannelSplitter(e) {
      return this._context.createChannelSplitter(e);
    }
    createConstantSource() {
      return this._context.createConstantSource();
    }
    createConvolver() {
      return this._context.createConvolver();
    }
    createDelay(e) {
      return this._context.createDelay(e);
    }
    createDynamicsCompressor() {
      return this._context.createDynamicsCompressor();
    }
    createGain() {
      return this._context.createGain();
    }
    createIIRFilter(e, t) {
      return this._context.createIIRFilter(e, t);
    }
    createPanner() {
      return this._context.createPanner();
    }
    createPeriodicWave(e, t, n) {
      return this._context.createPeriodicWave(e, t, n);
    }
    createStereoPanner() {
      return this._context.createStereoPanner();
    }
    createWaveShaper() {
      return this._context.createWaveShaper();
    }
    createMediaStreamSource(e) {
      return (
        K(Cs(this._context), `Not available if OfflineAudioContext`),
        this._context.createMediaStreamSource(e)
      );
    }
    createMediaElementSource(e) {
      return (
        K(Cs(this._context), `Not available if OfflineAudioContext`),
        this._context.createMediaElementSource(e)
      );
    }
    createMediaStreamDestination() {
      return (
        K(Cs(this._context), `Not available if OfflineAudioContext`),
        this._context.createMediaStreamDestination()
      );
    }
    decodeAudioData(e) {
      return this._context.decodeAudioData(e);
    }
    get currentTime() {
      return this._context.currentTime;
    }
    get state() {
      return this._context.state;
    }
    get sampleRate() {
      return this._context.sampleRate;
    }
    get listener() {
      return (this.initialize(), this._listener);
    }
    set listener(e) {
      (K(!this._initialized, `The listener cannot be set after initialization.`),
        (this._listener = e));
    }
    get transport() {
      return (this.initialize(), this._transport);
    }
    set transport(e) {
      (K(!this._initialized, `The transport cannot be set after initialization.`),
        (this._transport = e));
    }
    get draw() {
      return (this.initialize(), this._draw);
    }
    set draw(e) {
      (K(!this._initialized, `Draw cannot be set after initialization.`),
        (this._draw = e));
    }
    get destination() {
      return (this.initialize(), this._destination);
    }
    set destination(e) {
      (K(!this._initialized, `The destination cannot be set after initialization.`),
        (this._destination = e));
    }
    createAudioWorkletNode(e, t) {
      return _s(this.rawContext, e, t);
    }
    addAudioWorkletModule(e) {
      return q(this, void 0, void 0, function* () {
        (K(
          G(this.rawContext.audioWorklet),
          `AudioWorkletNode is only available in a secure context (https or localhost)`,
        ),
          (this._workletPromise ||= this.rawContext.audioWorklet.addModule(e)),
          yield this._workletPromise);
      });
    }
    workletsAreReady() {
      return q(this, void 0, void 0, function* () {
        (yield this._workletPromise) ? this._workletPromise : Promise.resolve();
      });
    }
    get updateInterval() {
      return this._ticker.updateInterval;
    }
    set updateInterval(e) {
      this._ticker.updateInterval = e;
    }
    get clockSource() {
      return this._ticker.type;
    }
    set clockSource(e) {
      this._ticker.type = e;
    }
    get lookAhead() {
      return this._lookAhead;
    }
    set lookAhead(e) {
      ((this._lookAhead = e), (this.updateInterval = e ? e / 2 : 0.01));
    }
    get latencyHint() {
      return this._latencyHint;
    }
    get rawContext() {
      return this._context;
    }
    now() {
      return this._context.currentTime + this._lookAhead;
    }
    immediate() {
      return this._context.currentTime;
    }
    resume() {
      return Cs(this._context) ? this._context.resume() : Promise.resolve();
    }
    close() {
      return q(this, void 0, void 0, function* () {
        (Cs(this._context) &&
          this.state !== `closed` &&
          !this._closeStarted &&
          ((this._closeStarted = !0), yield this._context.close()),
          this._initialized && Ws(this));
      });
    }
    getConstant(e) {
      if (this._constants.has(e)) return this._constants.get(e);
      {
        let t = this._context.createBuffer(1, 128, this._context.sampleRate),
          n = t.getChannelData(0);
        for (let t = 0; t < n.length; t++) n[t] = e;
        let r = this._context.createBufferSource();
        return (
          (r.channelCount = 1),
          (r.channelCountMode = `explicit`),
          (r.buffer = t),
          (r.loop = !0),
          r.start(0),
          this._constants.set(e, r),
          r
        );
      }
    }
    dispose() {
      return (
        super.dispose(),
        this._ticker.dispose(),
        this._timeouts.dispose(),
        Object.keys(this._constants).map((e) => this._constants[e].disconnect()),
        this.close(),
        this
      );
    }
    _timeoutLoop() {
      let e = this.now();
      this._timeouts.forEachBefore(e, (e) => {
        (e.callback(), this._timeouts.remove(e));
      });
    }
    setTimeout(e, t) {
      this._timeoutIds++;
      let n = this.now();
      return (
        this._timeouts.add({ callback: e, id: this._timeoutIds, time: n + t }),
        this._timeoutIds
      );
    }
    clearTimeout(e) {
      return (
        this._timeouts.forEach((t) => {
          t.id === e && this._timeouts.remove(t);
        }),
        this
      );
    }
    clearInterval(e) {
      return this.clearTimeout(e);
    }
    setInterval(e, t) {
      let n = ++this._timeoutIds,
        r = () => {
          let i = this.now();
          this._timeouts.add({
            callback: () => {
              (e(), r());
            },
            id: n,
            time: i + t,
          });
        };
      return (r(), n);
    }
  },
  Js = class extends Ks {
    constructor() {
      (super(...arguments),
        (this.lookAhead = 0),
        (this.latencyHint = 0),
        (this.isOffline = !1));
    }
    createAnalyser() {
      return {};
    }
    createOscillator() {
      return {};
    }
    createBufferSource() {
      return {};
    }
    createBiquadFilter() {
      return {};
    }
    createBuffer(e, t, n) {
      return {};
    }
    createChannelMerger(e) {
      return {};
    }
    createChannelSplitter(e) {
      return {};
    }
    createConstantSource() {
      return {};
    }
    createConvolver() {
      return {};
    }
    createDelay(e) {
      return {};
    }
    createDynamicsCompressor() {
      return {};
    }
    createGain() {
      return {};
    }
    createIIRFilter(e, t) {
      return {};
    }
    createPanner() {
      return {};
    }
    createPeriodicWave(e, t, n) {
      return {};
    }
    createStereoPanner() {
      return {};
    }
    createWaveShaper() {
      return {};
    }
    createMediaStreamSource(e) {
      return {};
    }
    createMediaElementSource(e) {
      return {};
    }
    createMediaStreamDestination() {
      return {};
    }
    decodeAudioData(e) {
      return Promise.resolve({});
    }
    createAudioWorkletNode(e, t) {
      return {};
    }
    get rawContext() {
      return {};
    }
    addAudioWorkletModule(e) {
      return q(this, void 0, void 0, function* () {
        return Promise.resolve();
      });
    }
    resume() {
      return Promise.resolve();
    }
    setTimeout(e, t) {
      return 0;
    }
    clearTimeout(e) {
      return this;
    }
    setInterval(e, t) {
      return 0;
    }
    clearInterval(e) {
      return this;
    }
    getConstant(e) {
      return {};
    }
    get currentTime() {
      return 0;
    }
    get state() {
      return {};
    }
    get sampleRate() {
      return 0;
    }
    get listener() {
      return {};
    }
    get transport() {
      return {};
    }
    get draw() {
      return {};
    }
    set draw(e) {}
    get destination() {
      return {};
    }
    set destination(e) {}
    now() {
      return 0;
    }
    immediate() {
      return 0;
    }
  };
function Y(e, t) {
  ts(t)
    ? t.forEach((t) => Y(e, t))
    : Object.defineProperty(e, t, { enumerable: !0, writable: !1 });
}
function Ys(e, t) {
  ts(t) ? t.forEach((t) => Ys(e, t)) : Object.defineProperty(e, t, { writable: !0 });
}
var X = () => {},
  Xs = class e extends js {
    constructor() {
      (super(), (this.name = `ToneAudioBuffer`), (this.onload = X));
      let t = J(e.getDefaults(), arguments, [`url`, `onload`, `onerror`]);
      ((this.reverse = t.reverse),
        (this.onload = t.onload),
        ns(t.url) ? this.load(t.url).catch(t.onerror) : t.url && this.set(t.url));
    }
    static getDefaults() {
      return { onerror: X, onload: X, reverse: !1 };
    }
    get sampleRate() {
      return this._buffer ? this._buffer.sampleRate : ec().sampleRate;
    }
    set(t) {
      return (
        t instanceof e
          ? t.loaded
            ? (this._buffer = t.get())
            : (t.onload = () => {
                (this.set(t), this.onload(this));
              })
          : (this._buffer = t),
        this._reversed && this._reverse(),
        this
      );
    }
    get() {
      return this._buffer;
    }
    load(t) {
      return q(this, void 0, void 0, function* () {
        let n = e.load(t).then((e) => {
          (this.set(e), this.onload(this));
        });
        e.downloads.push(n);
        try {
          yield n;
        } finally {
          let t = e.downloads.indexOf(n);
          e.downloads.splice(t, 1);
        }
        return this;
      });
    }
    dispose() {
      return (super.dispose(), (this._buffer = void 0), this);
    }
    fromArray(e) {
      let t = ts(e) && e[0].length > 0,
        n = t ? e.length : 1,
        r = t ? e[0].length : e.length,
        i = ec(),
        a = i.createBuffer(n, r, i.sampleRate),
        o = !t && n === 1 ? [e] : e;
      for (let e = 0; e < n; e++) a.copyToChannel(o[e], e);
      return ((this._buffer = a), this);
    }
    toMono(e) {
      if (Qo(e)) this.fromArray(this.toArray(e));
      else {
        let e = new Float32Array(this.length),
          t = this.numberOfChannels;
        for (let n = 0; n < t; n++) {
          let t = this.toArray(n);
          for (let n = 0; n < t.length; n++) e[n] += t[n];
        }
        ((e = e.map((e) => e / t)), this.fromArray(e));
      }
      return this;
    }
    toArray(e) {
      if (Qo(e)) return this.getChannelData(e);
      if (this.numberOfChannels === 1) return this.toArray(0);
      {
        let e = [];
        for (let t = 0; t < this.numberOfChannels; t++) e[t] = this.getChannelData(t);
        return e;
      }
    }
    getChannelData(e) {
      return this._buffer ? this._buffer.getChannelData(e) : new Float32Array();
    }
    slice(t, n = this.duration) {
      K(this.loaded, `Buffer is not loaded`);
      let r = Math.floor(t * this.sampleRate),
        i = Math.floor(n * this.sampleRate);
      K(r < i, `The start time must be less than the end time`);
      let a = i - r,
        o = ec().createBuffer(this.numberOfChannels, a, this.sampleRate);
      for (let e = 0; e < this.numberOfChannels; e++)
        o.copyToChannel(this.getChannelData(e).subarray(r, i), e);
      return new e(o);
    }
    _reverse() {
      if (this.loaded)
        for (let e = 0; e < this.numberOfChannels; e++) this.getChannelData(e).reverse();
      return this;
    }
    get loaded() {
      return this.length > 0;
    }
    get duration() {
      return this._buffer ? this._buffer.duration : 0;
    }
    get length() {
      return this._buffer ? this._buffer.length : 0;
    }
    get numberOfChannels() {
      return this._buffer ? this._buffer.numberOfChannels : 0;
    }
    get reverse() {
      return this._reversed;
    }
    set reverse(e) {
      this._reversed !== e && ((this._reversed = e), this._reverse());
    }
    static fromArray(t) {
      return new e().fromArray(t);
    }
    static fromUrl(t) {
      return q(this, void 0, void 0, function* () {
        return yield new e().load(t);
      });
    }
    static load(t) {
      return q(this, void 0, void 0, function* () {
        let n = e.baseUrl === `` || e.baseUrl.endsWith(`/`) ? e.baseUrl : e.baseUrl + `/`,
          r = yield fetch(n + t);
        if (!r.ok) throw Error(`could not load url: ${t}`);
        let i = yield r.arrayBuffer();
        return yield ec().decodeAudioData(i);
      });
    }
    static supportsType(e) {
      let t = e.split(`.`),
        n = t[t.length - 1];
      return document.createElement(`audio`).canPlayType(`audio/` + n) !== ``;
    }
    static loaded() {
      return q(this, void 0, void 0, function* () {
        for (yield Promise.resolve(); e.downloads.length;) yield e.downloads[0];
      });
    }
  };
((Xs.baseUrl = ``), (Xs.downloads = []));
var Zs = class extends qs {
    constructor() {
      (super({
        clockSource: `offline`,
        context: Ss(arguments[0])
          ? arguments[0]
          : ms(arguments[0], arguments[1] * arguments[2], arguments[2]),
        lookAhead: 0,
        updateInterval: Ss(arguments[0])
          ? 128 / arguments[0].sampleRate
          : 128 / arguments[2],
      }),
        (this.name = `OfflineContext`),
        (this._currentTime = 0),
        (this.isOffline = !0),
        (this._duration = Ss(arguments[0])
          ? arguments[0].length / arguments[0].sampleRate
          : arguments[1]));
    }
    now() {
      return this._currentTime;
    }
    get currentTime() {
      return this._currentTime;
    }
    _renderClock(e) {
      return q(this, void 0, void 0, function* () {
        let t = 0;
        for (; this._duration - this._currentTime >= 0;) {
          (this.emit(`tick`), (this._currentTime += 128 / this.sampleRate), t++);
          let n = Math.floor(this.sampleRate / 128);
          e && t % n === 0 && (yield new Promise((e) => setTimeout(e, 1)));
        }
      });
    }
    render() {
      return q(this, arguments, void 0, function* (e = !0) {
        return (
          yield this.workletsAreReady(),
          yield this._renderClock(e),
          new Xs(yield this._context.startRendering())
        );
      });
    }
    close() {
      return Promise.resolve();
    }
  },
  Qs = new Js(),
  $s = Qs;
function ec() {
  return ($s === Qs && gs && tc(new qs()), $s);
}
function tc(e, t = !1) {
  (t && $s.dispose(), ($s = Cs(e) ? new qs(e) : Ss(e) ? new Zs(e) : e));
}
function nc() {
  return $s.resume();
}
if (hs && !hs.TONE_SILENCE_LOGGING) {
  let e = ` * Tone.js v${T} * `;
  console.log(`%c${e}`, `background: #000; color: #fff`);
}
function rc(e) {
  return 10 ** (e / 20);
}
function ic(e) {
  return (Math.log(e) / Math.LN10) * 20;
}
function ac(e) {
  return 2 ** (e / 12);
}
var oc = 440;
function sc() {
  return oc;
}
function cc(e) {
  oc = e;
}
function lc(e) {
  return Math.round(uc(e));
}
function uc(e) {
  return 69 + 12 * Math.log2(e / oc);
}
function dc(e) {
  return oc * 2 ** ((e - 69) / 12);
}
var fc = class e extends js {
    constructor(e, t, n) {
      (super(),
        (this.defaultUnits = `s`),
        (this._val = t),
        (this._units = n),
        (this.context = e),
        (this._expressions = this._getExpressions()));
    }
    _getExpressions() {
      return {
        hz: {
          method: (e) => this._frequencyToUnits(parseFloat(e)),
          regexp: /^(\d+(?:\.\d+)?)hz$/i,
        },
        i: { method: (e) => this._ticksToUnits(parseInt(e, 10)), regexp: /^(\d+)i$/i },
        m: {
          method: (e) => this._beatsToUnits(parseInt(e, 10) * this._getTimeSignature()),
          regexp: /^(\d+)m$/i,
        },
        n: {
          method: (e, t) => {
            let n = parseInt(e, 10),
              r = t === `.` ? 1.5 : 1;
            return n === 1
              ? this._beatsToUnits(this._getTimeSignature()) * r
              : this._beatsToUnits(4 / n) * r;
          },
          regexp: /^(\d+)n(\.?)$/i,
        },
        number: {
          method: (e) => this._expressions[this.defaultUnits].method.call(this, e),
          regexp: /^(\d+(?:\.\d+)?)$/,
        },
        s: {
          method: (e) => this._secondsToUnits(parseFloat(e)),
          regexp: /^(\d+(?:\.\d+)?)s$/,
        },
        samples: {
          method: (e) => parseInt(e, 10) / this.context.sampleRate,
          regexp: /^(\d+)samples$/,
        },
        t: {
          method: (e) => {
            let t = parseInt(e, 10);
            return this._beatsToUnits(8 / (Math.floor(t) * 3));
          },
          regexp: /^(\d+)t$/i,
        },
        tr: {
          method: (e, t, n) => {
            let r = 0;
            return (
              e &&
                e !== `0` &&
                (r += this._beatsToUnits(this._getTimeSignature() * parseFloat(e))),
              t && t !== `0` && (r += this._beatsToUnits(parseFloat(t))),
              n && n !== `0` && (r += this._beatsToUnits(parseFloat(n) / 4)),
              r
            );
          },
          regexp: /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?):?(\d+(?:\.\d+)?)?$/,
        },
      };
    }
    valueOf() {
      if ((this._val instanceof e && this.fromType(this._val), Xo(this._val)))
        return this._noArg();
      if (ns(this._val) && Xo(this._units)) {
        for (let e in this._expressions)
          if (this._expressions[e].regexp.test(this._val.trim())) {
            this._units = e;
            break;
          }
      } else if ($o(this._val)) {
        let e = 0;
        for (let t in this._val)
          if (G(this._val[t])) {
            let n = this._val[t],
              r = new this.constructor(this.context, t).valueOf() * n;
            e += r;
          }
        return e;
      }
      if (G(this._units)) {
        let e = this._expressions[this._units],
          t = this._val.toString().trim().match(e.regexp);
        return t ? e.method.apply(this, t.slice(1)) : e.method.call(this, this._val);
      } else if (ns(this._val)) return parseFloat(this._val);
      else return this._val;
    }
    _frequencyToUnits(e) {
      return 1 / e;
    }
    _beatsToUnits(e) {
      return (60 / this._getBpm()) * e;
    }
    _secondsToUnits(e) {
      return e;
    }
    _ticksToUnits(e) {
      return (e * this._beatsToUnits(1)) / this._getPPQ();
    }
    _noArg() {
      return this._now();
    }
    _getBpm() {
      return this.context.transport.bpm.value;
    }
    _getTimeSignature() {
      return this.context.transport.timeSignature;
    }
    _getPPQ() {
      return this.context.transport.PPQ;
    }
    fromType(e) {
      switch (((this._units = void 0), this.defaultUnits)) {
        case `s`:
          this._val = e.toSeconds();
          break;
        case `i`:
          this._val = e.toTicks();
          break;
        case `hz`:
          this._val = e.toFrequency();
          break;
        case `midi`:
          this._val = e.toMidi();
          break;
      }
      return this;
    }
    toFrequency() {
      return 1 / this.toSeconds();
    }
    toSamples() {
      return this.toSeconds() * this.context.sampleRate;
    }
    toMilliseconds() {
      return this.toSeconds() * 1e3;
    }
  },
  pc = class e extends fc {
    constructor() {
      (super(...arguments), (this.name = `TimeClass`));
    }
    _getExpressions() {
      return Object.assign(super._getExpressions(), {
        now: {
          method: (e) => this._now() + new this.constructor(this.context, e).valueOf(),
          regexp: /^\+(.+)/,
        },
        quantize: {
          method: (t) => {
            let n = new e(this.context, t).valueOf();
            return this._secondsToUnits(this.context.transport.nextSubdivision(n));
          },
          regexp: /^@(.+)/,
        },
      });
    }
    quantize(e, t = 1) {
      let n = new this.constructor(this.context, e).valueOf(),
        r = this.valueOf();
      return r + (Math.round(r / n) * n - r) * t;
    }
    toNotation() {
      let t = this.toSeconds(),
        n = [`1m`];
      for (let e = 1; e < 9; e++) {
        let t = 2 ** e;
        (n.push(t + `n.`), n.push(t + `n`), n.push(t + `t`));
      }
      n.push(`0`);
      let r = n[0],
        i = new e(this.context, n[0]).toSeconds();
      return (
        n.forEach((n) => {
          let a = new e(this.context, n).toSeconds();
          Math.abs(a - t) < Math.abs(i - t) && ((r = n), (i = a));
        }),
        r
      );
    }
    toBarsBeatsSixteenths() {
      let e = this._beatsToUnits(1),
        t = this.valueOf() / e;
      t = parseFloat(t.toFixed(4));
      let n = Math.floor(t / this._getTimeSignature()),
        r = (t % 1) * 4;
      t = Math.floor(t) % this._getTimeSignature();
      let i = r.toString();
      return (
        i.length > 3 && (r = parseFloat(parseFloat(i).toFixed(3))),
        [n, t, r].join(`:`)
      );
    }
    toTicks() {
      let e = this._beatsToUnits(1);
      return (this.valueOf() / e) * this._getPPQ();
    }
    toSeconds() {
      return this.valueOf();
    }
    toMidi() {
      return lc(this.toFrequency());
    }
    _now() {
      return this.context.now();
    }
  },
  mc = class e extends pc {
    constructor() {
      (super(...arguments), (this.name = `Frequency`), (this.defaultUnits = `hz`));
    }
    static get A4() {
      return sc();
    }
    static set A4(e) {
      cc(e);
    }
    _getExpressions() {
      return Object.assign({}, super._getExpressions(), {
        midi: {
          regexp: /^(\d+(?:\.\d+)?midi)/,
          method(t) {
            return this.defaultUnits === `midi` ? t : e.mtof(t);
          },
        },
        note: {
          regexp: /^([a-g]{1}(?:b|#|##|x|bb|###|#x|x#|bbb)?)(-?[0-9]+)/i,
          method(t, n) {
            let r = hc[t.toLowerCase()] + (parseInt(n, 10) + 1) * 12;
            return this.defaultUnits === `midi` ? r : e.mtof(r);
          },
        },
        tr: {
          regexp: /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?):?(\d+(?:\.\d+)?)?/,
          method(e, t, n) {
            let r = 1;
            return (
              e &&
                e !== `0` &&
                (r *= this._beatsToUnits(this._getTimeSignature() * parseFloat(e))),
              t && t !== `0` && (r *= this._beatsToUnits(parseFloat(t))),
              n && n !== `0` && (r *= this._beatsToUnits(parseFloat(n) / 4)),
              r
            );
          },
        },
      });
    }
    transpose(t) {
      return new e(this.context, this.valueOf() * ac(t));
    }
    harmonize(e) {
      return e.map((e) => this.transpose(e));
    }
    toMidi() {
      return lc(this.valueOf());
    }
    toNote() {
      let t = this.toFrequency(),
        n = Math.log2(t / e.A4),
        r = Math.round(12 * n) + 57,
        i = Math.floor(r / 12);
      return (i < 0 && (r += -12 * i), gc[r % 12] + i.toString());
    }
    toSeconds() {
      return 1 / super.toSeconds();
    }
    toTicks() {
      let e = this._beatsToUnits(1),
        t = this.valueOf() / e;
      return Math.floor(t * this._getPPQ());
    }
    _noArg() {
      return 0;
    }
    _frequencyToUnits(e) {
      return e;
    }
    _ticksToUnits(e) {
      return 1 / ((e * 60) / (this._getBpm() * this._getPPQ()));
    }
    _beatsToUnits(e) {
      return 1 / super._beatsToUnits(e);
    }
    _secondsToUnits(e) {
      return 1 / e;
    }
    static mtof(e) {
      return dc(e);
    }
    static ftom(e) {
      return lc(e);
    }
  },
  hc = {
    cbbb: -3,
    cbb: -2,
    cb: -1,
    c: 0,
    'c#': 1,
    cx: 2,
    'c##': 2,
    'c###': 3,
    'cx#': 3,
    'c#x': 3,
    dbbb: -1,
    dbb: 0,
    db: 1,
    d: 2,
    'd#': 3,
    dx: 4,
    'd##': 4,
    'd###': 5,
    'dx#': 5,
    'd#x': 5,
    ebbb: 1,
    ebb: 2,
    eb: 3,
    e: 4,
    'e#': 5,
    ex: 6,
    'e##': 6,
    'e###': 7,
    'ex#': 7,
    'e#x': 7,
    fbbb: 2,
    fbb: 3,
    fb: 4,
    f: 5,
    'f#': 6,
    fx: 7,
    'f##': 7,
    'f###': 8,
    'fx#': 8,
    'f#x': 8,
    gbbb: 4,
    gbb: 5,
    gb: 6,
    g: 7,
    'g#': 8,
    gx: 9,
    'g##': 9,
    'g###': 10,
    'gx#': 10,
    'g#x': 10,
    abbb: 6,
    abb: 7,
    ab: 8,
    a: 9,
    'a#': 10,
    ax: 11,
    'a##': 11,
    'a###': 12,
    'ax#': 12,
    'a#x': 12,
    bbbb: 8,
    bbb: 9,
    bb: 10,
    b: 11,
    'b#': 12,
    bx: 13,
    'b##': 13,
    'b###': 14,
    'bx#': 14,
    'b#x': 14,
  },
  gc = [`C`, `C#`, `D`, `D#`, `E`, `F`, `F#`, `G`, `G#`, `A`, `A#`, `B`];
function _c(e, t) {
  return new mc(ec(), e, t);
}
var vc = class extends pc {
    constructor() {
      (super(...arguments), (this.name = `TransportTime`));
    }
    _now() {
      return this.context.transport.seconds;
    }
  },
  yc = class e extends js {
    constructor() {
      super();
      let t = J(e.getDefaults(), arguments, [`context`]);
      this.defaultContext
        ? (this.context = this.defaultContext)
        : (this.context = t.context);
    }
    static getDefaults() {
      return { context: ec() };
    }
    now() {
      return this.context.currentTime + this.context.lookAhead;
    }
    immediate() {
      return this.context.currentTime;
    }
    get sampleTime() {
      return 1 / this.context.sampleRate;
    }
    get blockTime() {
      return 128 / this.context.sampleRate;
    }
    toSeconds(e) {
      return (ls(e), new pc(this.context, e).toSeconds());
    }
    toFrequency(e) {
      return new mc(this.context, e).toFrequency();
    }
    toTicks(e) {
      return new vc(this.context, e).toTicks();
    }
    _getPartialProperties(e) {
      let t = this.get();
      return (
        Object.keys(t).forEach((n) => {
          Xo(e[n]) && delete t[n];
        }),
        t
      );
    }
    get() {
      let t = Os(this);
      return (
        Object.keys(t).forEach((n) => {
          if (Reflect.has(this, n)) {
            let r = this[n];
            G(r) && G(r.value) && G(r.setValueAtTime)
              ? (t[n] = r.value)
              : r instanceof e
                ? (t[n] = r._getPartialProperties(t[n]))
                : ts(r) || Qo(r) || ns(r) || es(r)
                  ? (t[n] = r)
                  : delete t[n];
          }
        }),
        t
      );
    }
    set(t) {
      return (
        Object.keys(t).forEach((n) => {
          Reflect.has(this, n) &&
            G(this[n]) &&
            (this[n] && G(this[n].value) && G(this[n].setValueAtTime)
              ? this[n].value !== t[n] && (this[n].value = t[n])
              : this[n] instanceof e
                ? this[n].set(t[n])
                : (this[n] = t[n]));
        }),
        this
      );
    }
  },
  bc = class extends Rs {
    constructor(e = `stopped`) {
      (super(),
        (this.name = `StateTimeline`),
        (this._initial = e),
        this.setStateAtTime(this._initial, 0));
    }
    getValueAtTime(e) {
      let t = this.get(e);
      return t === null ? this._initial : t.state;
    }
    setStateAtTime(e, t, n) {
      return (is(t, 0), this.add(Object.assign({}, n, { state: e, time: t })), this);
    }
    getLastState(e, t) {
      let n = this._search(t);
      for (let t = n; t >= 0; t--) {
        let n = this._timeline[t];
        if (n.state === e) return n;
      }
    }
    getNextState(e, t) {
      let n = this._search(t);
      if (n !== -1)
        for (let t = n; t < this._timeline.length; t++) {
          let n = this._timeline[t];
          if (n.state === e) return n;
        }
    }
  },
  Z = class e extends yc {
    constructor() {
      let t = J(e.getDefaults(), arguments, [`param`, `units`, `convert`]);
      for (
        super(t),
          this.name = `Param`,
          this.overridden = !1,
          this._minOutput = 1e-7,
          K(
            G(t.param) && (bs(t.param) || t.param instanceof e),
            `param must be an AudioParam`,
          );
        !bs(t.param);
      )
        t.param = t.param._param;
      ((this._swappable = G(t.swappable) ? t.swappable : !1),
        this._swappable
          ? ((this.input = this.context.createGain()),
            (this._param = t.param),
            this.input.connect(this._param))
          : (this._param = this.input = t.param),
        (this._events = new Rs(1e3)),
        (this._initialValue = this._param.defaultValue),
        (this.units = t.units),
        (this.convert = t.convert),
        (this._minValue = t.minValue),
        (this._maxValue = t.maxValue),
        G(t.value) &&
          t.value !== this._toType(this._initialValue) &&
          this.setValueAtTime(t.value, 0));
    }
    static getDefaults() {
      return Object.assign(yc.getDefaults(), { convert: !0, units: `number` });
    }
    get value() {
      let e = this.now();
      return this.getValueAtTime(e);
    }
    set value(e) {
      (this.cancelScheduledValues(this.now()), this.setValueAtTime(e, this.now()));
    }
    get minValue() {
      return G(this._minValue)
        ? this._minValue
        : this.units === `time` ||
            this.units === `frequency` ||
            this.units === `normalRange` ||
            this.units === `positive` ||
            this.units === `transportTime` ||
            this.units === `ticks` ||
            this.units === `bpm` ||
            this.units === `hertz` ||
            this.units === `samples`
          ? 0
          : this.units === `audioRange`
            ? -1
            : this.units === `decibels`
              ? -1 / 0
              : this._param.minValue;
    }
    get maxValue() {
      return G(this._maxValue)
        ? this._maxValue
        : this.units === `normalRange` || this.units === `audioRange`
          ? 1
          : this._param.maxValue;
    }
    _is(e, t) {
      return this.units === t;
    }
    _assertRange(e) {
      return (
        G(this.maxValue) &&
          G(this.minValue) &&
          is(e, this._fromType(this.minValue), this._fromType(this.maxValue)),
        e
      );
    }
    _fromType(e) {
      return this.convert && !this.overridden
        ? this._is(e, `time`)
          ? this.toSeconds(e)
          : this._is(e, `decibels`)
            ? rc(e)
            : this._is(e, `frequency`)
              ? this.toFrequency(e)
              : e
        : this.overridden
          ? 0
          : e;
    }
    _toType(e) {
      return this.convert && this.units === `decibels` ? ic(e) : e;
    }
    setValueAtTime(e, t) {
      let n = this.toSeconds(t),
        r = this._fromType(e);
      return (
        K(
          isFinite(r) && isFinite(n),
          `Invalid argument(s) to setValueAtTime: ${JSON.stringify(e)}, ${JSON.stringify(t)}`,
        ),
        this._assertRange(r),
        this.log(this.units, `setValueAtTime`, e, n),
        this._events.add({ time: n, type: `setValueAtTime`, value: r }),
        this._param.setValueAtTime(r, n),
        this
      );
    }
    getValueAtTime(e) {
      let t = Math.max(this.toSeconds(e), 0),
        n = this._events.getAfter(t),
        r = this._events.get(t),
        i = this._initialValue;
      if (r === null) i = this._initialValue;
      else if (
        r.type === `setTargetAtTime` &&
        (n === null || n.type === `setValueAtTime`)
      ) {
        let e = this._events.getBefore(r.time),
          n;
        ((n = e === null ? this._initialValue : e.value),
          r.type === `setTargetAtTime` &&
            (i = this._exponentialApproach(r.time, n, r.value, r.constant, t)));
      } else if (n === null) i = r.value;
      else if (
        n.type === `linearRampToValueAtTime` ||
        n.type === `exponentialRampToValueAtTime`
      ) {
        let e = r.value;
        if (r.type === `setTargetAtTime`) {
          let t = this._events.getBefore(r.time);
          e = t === null ? this._initialValue : t.value;
        }
        i =
          n.type === `linearRampToValueAtTime`
            ? this._linearInterpolate(r.time, e, n.time, n.value, t)
            : this._exponentialInterpolate(r.time, e, n.time, n.value, t);
      } else i = r.value;
      return this._toType(i);
    }
    setRampPoint(e) {
      e = this.toSeconds(e);
      let t = this.getValueAtTime(e);
      return (
        this.cancelAndHoldAtTime(e),
        this._fromType(t) === 0 && (t = this._toType(this._minOutput)),
        this.setValueAtTime(t, e),
        this
      );
    }
    linearRampToValueAtTime(e, t) {
      let n = this._fromType(e),
        r = this.toSeconds(t);
      return (
        K(
          isFinite(n) && isFinite(r),
          `Invalid argument(s) to linearRampToValueAtTime: ${JSON.stringify(e)}, ${JSON.stringify(t)}`,
        ),
        this._assertRange(n),
        this._events.add({ time: r, type: `linearRampToValueAtTime`, value: n }),
        this.log(this.units, `linearRampToValueAtTime`, e, r),
        this._param.linearRampToValueAtTime(n, r),
        this
      );
    }
    exponentialRampToValueAtTime(e, t) {
      let n = this._fromType(e);
      ((n = Is(n, 0) ? this._minOutput : n), this._assertRange(n));
      let r = this.toSeconds(t);
      return (
        K(
          isFinite(n) && isFinite(r),
          `Invalid argument(s) to exponentialRampToValueAtTime: ${JSON.stringify(e)}, ${JSON.stringify(t)}`,
        ),
        this._events.add({ time: r, type: `exponentialRampToValueAtTime`, value: n }),
        this.log(this.units, `exponentialRampToValueAtTime`, e, r),
        this._param.exponentialRampToValueAtTime(n, r),
        this
      );
    }
    exponentialRampTo(e, t, n) {
      return (
        (n = this.toSeconds(n)),
        this.setRampPoint(n),
        this.exponentialRampToValueAtTime(e, n + this.toSeconds(t)),
        this
      );
    }
    linearRampTo(e, t, n) {
      return (
        (n = this.toSeconds(n)),
        this.setRampPoint(n),
        this.linearRampToValueAtTime(e, n + this.toSeconds(t)),
        this
      );
    }
    targetRampTo(e, t, n) {
      return (
        (n = this.toSeconds(n)),
        this.setRampPoint(n),
        this.exponentialApproachValueAtTime(e, n, t),
        this
      );
    }
    exponentialApproachValueAtTime(e, t, n) {
      ((t = this.toSeconds(t)), (n = this.toSeconds(n)));
      let r = Math.log(n + 1) / Math.log(200);
      return (
        this.setTargetAtTime(e, t, r),
        this.cancelAndHoldAtTime(t + n * 0.9),
        this.linearRampToValueAtTime(e, t + n),
        this
      );
    }
    setTargetAtTime(e, t, n) {
      let r = this._fromType(e);
      K(isFinite(n) && n > 0, `timeConstant must be a number greater than 0`);
      let i = this.toSeconds(t);
      return (
        this._assertRange(r),
        K(
          isFinite(r) && isFinite(i),
          `Invalid argument(s) to setTargetAtTime: ${JSON.stringify(e)}, ${JSON.stringify(t)}`,
        ),
        this._events.add({ constant: n, time: i, type: `setTargetAtTime`, value: r }),
        this.log(this.units, `setTargetAtTime`, e, i, n),
        this._param.setTargetAtTime(r, i, n),
        this
      );
    }
    setValueCurveAtTime(e, t, n, r = 1) {
      ((n = this.toSeconds(n)), (t = this.toSeconds(t)));
      let i = this._fromType(e[0]) * r;
      this.setValueAtTime(this._toType(i), t);
      let a = n / (e.length - 1);
      for (let n = 1; n < e.length; n++) {
        let i = this._fromType(e[n]) * r;
        this.linearRampToValueAtTime(this._toType(i), t + n * a);
      }
      return this;
    }
    cancelScheduledValues(e) {
      let t = this.toSeconds(e);
      return (
        K(isFinite(t), `Invalid argument to cancelScheduledValues: ${JSON.stringify(e)}`),
        this._events.cancel(t),
        this._param.cancelScheduledValues(t),
        this.log(this.units, `cancelScheduledValues`, t),
        this
      );
    }
    cancelAndHoldAtTime(e) {
      let t = this.toSeconds(e),
        n = this._fromType(this.getValueAtTime(t));
      (K(isFinite(t), `Invalid argument to cancelAndHoldAtTime: ${JSON.stringify(e)}`),
        this.log(this.units, `cancelAndHoldAtTime`, t, `value=` + n));
      let r = this._events.get(t),
        i = this._events.getAfter(t);
      return (
        r && Is(r.time, t)
          ? i
            ? (this._param.cancelScheduledValues(i.time), this._events.cancel(i.time))
            : (this._param.cancelAndHoldAtTime(t),
              this._events.cancel(t + this.sampleTime))
          : i &&
            (this._param.cancelScheduledValues(i.time),
            this._events.cancel(i.time),
            i.type === `linearRampToValueAtTime`
              ? this.linearRampToValueAtTime(this._toType(n), t)
              : i.type === `exponentialRampToValueAtTime` &&
                this.exponentialRampToValueAtTime(this._toType(n), t)),
        this._events.add({ time: t, type: `setValueAtTime`, value: n }),
        this._param.setValueAtTime(n, t),
        this
      );
    }
    rampTo(e, t = 0.1, n) {
      return (
        this.units === `frequency` || this.units === `bpm` || this.units === `decibels`
          ? this.exponentialRampTo(e, t, n)
          : this.linearRampTo(e, t, n),
        this
      );
    }
    apply(e) {
      let t = this.context.currentTime;
      e.setValueAtTime(this.getValueAtTime(t), t);
      let n = this._events.get(t);
      if (n && n.type === `setTargetAtTime`) {
        let r = this._events.getAfter(n.time),
          i = r ? r.time : t + 2,
          a = (i - t) / 10;
        for (let n = t; n < i; n += a)
          e.linearRampToValueAtTime(this.getValueAtTime(n), n);
      }
      return (
        this._events.forEachAfter(this.context.currentTime, (t) => {
          t.type === `cancelScheduledValues`
            ? e.cancelScheduledValues(t.time)
            : t.type === `setTargetAtTime`
              ? e.setTargetAtTime(t.value, t.time, t.constant)
              : e[t.type](t.value, t.time);
        }),
        this
      );
    }
    setParam(e) {
      K(this._swappable, `The Param must be assigned as 'swappable' in the constructor`);
      let t = this.input;
      return (
        t.disconnect(this._param),
        this.apply(e),
        (this._param = e),
        t.connect(this._param),
        this
      );
    }
    dispose() {
      return (super.dispose(), this._events.dispose(), this);
    }
    get defaultValue() {
      return this._toType(this._param.defaultValue);
    }
    _exponentialApproach(e, t, n, r, i) {
      return n + (t - n) * Math.exp(-(i - e) / r);
    }
    _linearInterpolate(e, t, n, r, i) {
      return t + (r - t) * ((i - e) / (n - e));
    }
    _exponentialInterpolate(e, t, n, r, i) {
      return t * (r / t) ** +((i - e) / (n - e));
    }
  },
  Q = class e extends yc {
    constructor() {
      (super(...arguments), (this._internalChannels = []));
    }
    get numberOfInputs() {
      return G(this.input)
        ? bs(this.input) || this.input instanceof Z
          ? 1
          : this.input.numberOfInputs
        : 0;
    }
    get numberOfOutputs() {
      return G(this.output) ? this.output.numberOfOutputs : 0;
    }
    _isAudioNode(t) {
      return G(t) && (t instanceof e || xs(t));
    }
    _getInternalNodes() {
      let e = this._internalChannels.slice(0);
      return (
        this._isAudioNode(this.input) && e.push(this.input),
        this._isAudioNode(this.output) &&
          this.input !== this.output &&
          e.push(this.output),
        e
      );
    }
    _setChannelProperties(e) {
      this._getInternalNodes().forEach((t) => {
        ((t.channelCount = e.channelCount),
          (t.channelCountMode = e.channelCountMode),
          (t.channelInterpretation = e.channelInterpretation));
      });
    }
    _getChannelProperties() {
      let e = this._getInternalNodes();
      K(e.length > 0, `ToneAudioNode does not have any internal nodes`);
      let t = e[0];
      return {
        channelCount: t.channelCount,
        channelCountMode: t.channelCountMode,
        channelInterpretation: t.channelInterpretation,
      };
    }
    get channelCount() {
      return this._getChannelProperties().channelCount;
    }
    set channelCount(e) {
      let t = this._getChannelProperties();
      this._setChannelProperties(Object.assign(t, { channelCount: e }));
    }
    get channelCountMode() {
      return this._getChannelProperties().channelCountMode;
    }
    set channelCountMode(e) {
      let t = this._getChannelProperties();
      this._setChannelProperties(Object.assign(t, { channelCountMode: e }));
    }
    get channelInterpretation() {
      return this._getChannelProperties().channelInterpretation;
    }
    set channelInterpretation(e) {
      let t = this._getChannelProperties();
      this._setChannelProperties(Object.assign(t, { channelInterpretation: e }));
    }
    connect(e, t = 0, n = 0) {
      return (Sc(this, e, t, n), this);
    }
    toDestination() {
      return (this.connect(this.context.destination), this);
    }
    toMaster() {
      return (fs(`toMaster() has been renamed toDestination()`), this.toDestination());
    }
    disconnect(e, t = 0, n = 0) {
      return (Cc(this, e, t, n), this);
    }
    chain(...e) {
      return (xc(this, ...e), this);
    }
    fan(...e) {
      return (e.forEach((e) => this.connect(e)), this);
    }
    dispose() {
      return (
        super.dispose(),
        G(this.input) &&
          (this.input instanceof e
            ? this.input.dispose()
            : xs(this.input) && this.input.disconnect()),
        G(this.output) &&
          (this.output instanceof e
            ? this.output.dispose()
            : xs(this.output) && this.output.disconnect()),
        (this._internalChannels = []),
        this
      );
    }
  };
function xc(...e) {
  let t = e.shift();
  e.reduce((e, t) => (e instanceof Q ? e.connect(t) : xs(e) && Sc(e, t), t), t);
}
function Sc(e, t, n = 0, r = 0) {
  for (
    K(G(e), `Cannot connect from undefined node`),
      K(G(t), `Cannot connect to undefined node`),
      (t instanceof Q || xs(t)) &&
        K(t.numberOfInputs > 0, `Cannot connect to node with no inputs`),
      K(e.numberOfOutputs > 0, `Cannot connect from node with no outputs`);
    t instanceof Q || t instanceof Z;
  )
    G(t.input) && (t = t.input);
  for (; e instanceof Q;) G(e.output) && (e = e.output);
  bs(t) ? e.connect(t, n) : e.connect(t, n, r);
}
function Cc(e, t, n = 0, r = 0) {
  if (G(t)) for (; t instanceof Q;) t = t.input;
  for (; !xs(e);) G(e.output) && (e = e.output);
  bs(t) ? e.disconnect(t, n) : xs(t) ? e.disconnect(t, n, r) : e.disconnect();
}
var wc = class e extends Q {
    constructor() {
      let t = J(e.getDefaults(), arguments, [`gain`, `units`]);
      (super(t),
        (this.name = `Gain`),
        (this._gainNode = this.context.createGain()),
        (this.input = this._gainNode),
        (this.output = this._gainNode),
        (this.gain = new Z({
          context: this.context,
          convert: t.convert,
          param: this._gainNode.gain,
          units: t.units,
          value: t.gain,
          minValue: t.minValue,
          maxValue: t.maxValue,
        })),
        Y(this, `gain`));
    }
    static getDefaults() {
      return Object.assign(Q.getDefaults(), { convert: !0, gain: 1, units: `gain` });
    }
    dispose() {
      return (super.dispose(), this._gainNode.disconnect(), this.gain.dispose(), this);
    }
  },
  Tc = class extends Q {
    constructor(e) {
      (super(e),
        (this.onended = X),
        (this._startTime = -1),
        (this._stopTime = -1),
        (this._timeout = -1),
        (this.output = new wc({ context: this.context, gain: 0 })),
        (this._gainNode = this.output),
        (this.getStateAtTime = function (e) {
          let t = this.toSeconds(e);
          return this._startTime !== -1 &&
            t >= this._startTime &&
            (this._stopTime === -1 || t <= this._stopTime)
            ? `started`
            : `stopped`;
        }),
        (this._fadeIn = e.fadeIn),
        (this._fadeOut = e.fadeOut),
        (this._curve = e.curve),
        (this.onended = e.onended));
    }
    static getDefaults() {
      return Object.assign(Q.getDefaults(), {
        curve: `linear`,
        fadeIn: 0,
        fadeOut: 0,
        onended: X,
      });
    }
    _startGain(e, t = 1) {
      K(this._startTime === -1, `Source cannot be started more than once`);
      let n = this.toSeconds(this._fadeIn);
      return (
        (this._startTime = e + n),
        (this._startTime = Math.max(this._startTime, this.context.currentTime)),
        n > 0
          ? (this._gainNode.gain.setValueAtTime(0, e),
            this._curve === `linear`
              ? this._gainNode.gain.linearRampToValueAtTime(t, e + n)
              : this._gainNode.gain.exponentialApproachValueAtTime(t, e, n))
          : this._gainNode.gain.setValueAtTime(t, e),
        this
      );
    }
    stop(e) {
      return (this.log(`stop`, e), this._stopGain(this.toSeconds(e)), this);
    }
    _stopGain(e) {
      (K(this._startTime !== -1, `'start' must be called before 'stop'`),
        this.cancelStop());
      let t = this.toSeconds(this._fadeOut);
      return (
        (this._stopTime = this.toSeconds(e) + t),
        (this._stopTime = Math.max(this._stopTime, this.now())),
        t > 0
          ? this._curve === `linear`
            ? this._gainNode.gain.linearRampTo(0, t, e)
            : this._gainNode.gain.targetRampTo(0, t, e)
          : (this._gainNode.gain.cancelAndHoldAtTime(e),
            this._gainNode.gain.setValueAtTime(0, e)),
        this.context.clearTimeout(this._timeout),
        (this._timeout = this.context.setTimeout(() => {
          let e = this._curve === `exponential` ? t * 2 : 0;
          (this._stopSource(this.now() + e), this._onended());
        }, this._stopTime - this.context.currentTime)),
        this
      );
    }
    _onended() {
      if (
        this.onended !== X &&
        (this.onended(this), (this.onended = X), !this.context.isOffline)
      ) {
        let e = () => this.dispose();
        typeof requestIdleCallback < `u` ? requestIdleCallback(e) : setTimeout(e, 10);
      }
    }
    get state() {
      return this.getStateAtTime(this.now());
    }
    cancelStop() {
      return (
        this.log(`cancelStop`),
        K(this._startTime !== -1, `Source is not started`),
        this._gainNode.gain.cancelScheduledValues(this._startTime + this.sampleTime),
        this.context.clearTimeout(this._timeout),
        (this._stopTime = -1),
        this
      );
    }
    dispose() {
      return (super.dispose(), this._gainNode.dispose(), (this.onended = X), this);
    }
  },
  Ec = class e extends Tc {
    constructor() {
      let t = J(e.getDefaults(), arguments, [`offset`]);
      (super(t),
        (this.name = `ToneConstantSource`),
        (this._source = this.context.createConstantSource()),
        Sc(this._source, this._gainNode),
        (this.offset = new Z({
          context: this.context,
          convert: t.convert,
          param: this._source.offset,
          units: t.units,
          value: t.offset,
          minValue: t.minValue,
          maxValue: t.maxValue,
        })));
    }
    static getDefaults() {
      return Object.assign(Tc.getDefaults(), { convert: !0, offset: 1, units: `number` });
    }
    start(e) {
      let t = this.toSeconds(e);
      return (this.log(`start`, t), this._startGain(t), this._source.start(t), this);
    }
    _stopSource(e) {
      this._source.stop(e);
    }
    dispose() {
      return (
        super.dispose(),
        this.state === `started` && this.stop(),
        this._source.disconnect(),
        this.offset.dispose(),
        this
      );
    }
  },
  $ = class e extends Q {
    constructor() {
      let t = J(e.getDefaults(), arguments, [`value`, `units`]);
      (super(t),
        (this.name = `Signal`),
        (this.override = !0),
        (this.output = this._constantSource =
          new Ec({
            context: this.context,
            convert: t.convert,
            offset: t.value,
            units: t.units,
            minValue: t.minValue,
            maxValue: t.maxValue,
          })),
        this._constantSource.start(0),
        (this.input = this._param = this._constantSource.offset));
    }
    static getDefaults() {
      return Object.assign(Q.getDefaults(), { convert: !0, units: `number`, value: 0 });
    }
    connect(e, t = 0, n = 0) {
      return (Dc(this, e, t, n), this);
    }
    dispose() {
      return (
        super.dispose(),
        this._param.dispose(),
        this._constantSource.dispose(),
        this
      );
    }
    setValueAtTime(e, t) {
      return (this._param.setValueAtTime(e, t), this);
    }
    getValueAtTime(e) {
      return this._param.getValueAtTime(e);
    }
    setRampPoint(e) {
      return (this._param.setRampPoint(e), this);
    }
    linearRampToValueAtTime(e, t) {
      return (this._param.linearRampToValueAtTime(e, t), this);
    }
    exponentialRampToValueAtTime(e, t) {
      return (this._param.exponentialRampToValueAtTime(e, t), this);
    }
    exponentialRampTo(e, t, n) {
      return (this._param.exponentialRampTo(e, t, n), this);
    }
    linearRampTo(e, t, n) {
      return (this._param.linearRampTo(e, t, n), this);
    }
    targetRampTo(e, t, n) {
      return (this._param.targetRampTo(e, t, n), this);
    }
    exponentialApproachValueAtTime(e, t, n) {
      return (this._param.exponentialApproachValueAtTime(e, t, n), this);
    }
    setTargetAtTime(e, t, n) {
      return (this._param.setTargetAtTime(e, t, n), this);
    }
    setValueCurveAtTime(e, t, n, r) {
      return (this._param.setValueCurveAtTime(e, t, n, r), this);
    }
    cancelScheduledValues(e) {
      return (this._param.cancelScheduledValues(e), this);
    }
    cancelAndHoldAtTime(e) {
      return (this._param.cancelAndHoldAtTime(e), this);
    }
    rampTo(e, t, n) {
      return (this._param.rampTo(e, t, n), this);
    }
    get value() {
      return this._param.value;
    }
    set value(e) {
      this._param.value = e;
    }
    get convert() {
      return this._param.convert;
    }
    set convert(e) {
      this._param.convert = e;
    }
    get units() {
      return this._param.units;
    }
    get overridden() {
      return this._param.overridden;
    }
    set overridden(e) {
      this._param.overridden = e;
    }
    get maxValue() {
      return this._param.maxValue;
    }
    get minValue() {
      return this._param.minValue;
    }
    apply(e) {
      return (this._param.apply(e), this);
    }
  };
function Dc(e, t, n, r) {
  ((t instanceof Z || bs(t) || (t instanceof $ && t.override)) &&
    (t.cancelScheduledValues(0),
    t.setValueAtTime(0, 0),
    t instanceof $ && (t.overridden = !0)),
    Sc(e, t, n, r));
}
var Oc = class e extends Z {
    constructor() {
      let t = J(e.getDefaults(), arguments, [`value`]);
      (super(t),
        (this.name = `TickParam`),
        (this._events = new Rs(1 / 0)),
        (this._multiplier = 1),
        (this._multiplier = t.multiplier),
        this._events.cancel(0),
        this._events.add({
          ticks: 0,
          time: 0,
          type: `setValueAtTime`,
          value: this._fromType(t.value),
        }),
        this.setValueAtTime(t.value, 0));
    }
    static getDefaults() {
      return Object.assign(Z.getDefaults(), { multiplier: 1, units: `hertz`, value: 1 });
    }
    setTargetAtTime(e, t, n) {
      ((t = this.toSeconds(t)), this.setRampPoint(t));
      let r = this._fromType(e),
        i = this._events.get(t),
        a = Math.round(Math.max(1 / n, 1));
      for (let e = 0; e <= a; e++) {
        let a = n * e + t,
          o = this._exponentialApproach(i.time, i.value, r, n, a);
        this.linearRampToValueAtTime(this._toType(o), a);
      }
      return this;
    }
    setValueAtTime(e, t) {
      let n = this.toSeconds(t);
      super.setValueAtTime(e, t);
      let r = this._events.get(n),
        i = this._events.previousEvent(r),
        a = this._getTicksUntilEvent(i, n);
      return ((r.ticks = Math.max(a, 0)), this);
    }
    linearRampToValueAtTime(e, t) {
      let n = this.toSeconds(t);
      super.linearRampToValueAtTime(e, t);
      let r = this._events.get(n),
        i = this._events.previousEvent(r),
        a = this._getTicksUntilEvent(i, n);
      return ((r.ticks = Math.max(a, 0)), this);
    }
    exponentialRampToValueAtTime(e, t) {
      t = this.toSeconds(t);
      let n = this._fromType(e),
        r = this._events.get(t),
        i = Math.round(Math.max((t - r.time) * 10, 1)),
        a = (t - r.time) / i;
      for (let e = 0; e <= i; e++) {
        let i = a * e + r.time,
          o = this._exponentialInterpolate(r.time, r.value, t, n, i);
        this.linearRampToValueAtTime(this._toType(o), i);
      }
      return this;
    }
    _getTicksUntilEvent(e, t) {
      if (e === null) e = { ticks: 0, time: 0, type: `setValueAtTime`, value: 0 };
      else if (Xo(e.ticks)) {
        let t = this._events.previousEvent(e);
        e.ticks = this._getTicksUntilEvent(t, e.time);
      }
      let n = this._fromType(this.getValueAtTime(e.time)),
        r = this._fromType(this.getValueAtTime(t)),
        i = this._events.get(t);
      return (
        i &&
          i.time === t &&
          i.type === `setValueAtTime` &&
          (r = this._fromType(this.getValueAtTime(t - this.sampleTime))),
        0.5 * (t - e.time) * (n + r) + e.ticks
      );
    }
    getTicksAtTime(e) {
      let t = this.toSeconds(e),
        n = this._events.get(t);
      return Math.max(this._getTicksUntilEvent(n, t), 0);
    }
    getDurationOfTicks(e, t) {
      let n = this.toSeconds(t),
        r = this.getTicksAtTime(t);
      return this.getTimeOfTick(r + e) - n;
    }
    getTimeOfTick(e) {
      let t = this._events.get(e, `ticks`),
        n = this._events.getAfter(e, `ticks`);
      if (t && t.ticks === e) return t.time;
      if (t && n && n.type === `linearRampToValueAtTime` && t.value !== n.value) {
        let r = this._fromType(this.getValueAtTime(t.time)),
          i = (this._fromType(this.getValueAtTime(n.time)) - r) / (n.time - t.time),
          a = Math.sqrt(r ** 2 - 2 * i * (t.ticks - e)),
          o = (-r + a) / i,
          s = (-r - a) / i;
        return (o > 0 ? o : s) + t.time;
      } else if (t) return t.value === 0 ? 1 / 0 : t.time + (e - t.ticks) / t.value;
      else return e / this._initialValue;
    }
    ticksToTime(e, t) {
      return this.getDurationOfTicks(e, t);
    }
    timeToTicks(e, t) {
      let n = this.toSeconds(t),
        r = this.toSeconds(e),
        i = this.getTicksAtTime(n);
      return this.getTicksAtTime(n + r) - i;
    }
    _fromType(e) {
      return this.units === `bpm` && this.multiplier
        ? 1 / (60 / e / this.multiplier)
        : super._fromType(e);
    }
    _toType(e) {
      return this.units === `bpm` && this.multiplier
        ? (e / this.multiplier) * 60
        : super._toType(e);
    }
    get multiplier() {
      return this._multiplier;
    }
    set multiplier(e) {
      let t = this.value;
      ((this._multiplier = e), this.cancelScheduledValues(0), this.setValueAtTime(t, 0));
    }
  },
  kc = class e extends $ {
    constructor() {
      let t = J(e.getDefaults(), arguments, [`value`]);
      (super(t),
        (this.name = `TickSignal`),
        (this.input = this._param =
          new Oc({
            context: this.context,
            convert: t.convert,
            multiplier: t.multiplier,
            param: this._constantSource.offset,
            units: t.units,
            value: t.value,
          })));
    }
    static getDefaults() {
      return Object.assign($.getDefaults(), { multiplier: 1, units: `hertz`, value: 1 });
    }
    ticksToTime(e, t) {
      return this._param.ticksToTime(e, t);
    }
    timeToTicks(e, t) {
      return this._param.timeToTicks(e, t);
    }
    getTimeOfTick(e) {
      return this._param.getTimeOfTick(e);
    }
    getDurationOfTicks(e, t) {
      return this._param.getDurationOfTicks(e, t);
    }
    getTicksAtTime(e) {
      return this._param.getTicksAtTime(e);
    }
    get multiplier() {
      return this._param.multiplier;
    }
    set multiplier(e) {
      this._param.multiplier = e;
    }
    dispose() {
      return (super.dispose(), this._param.dispose(), this);
    }
  },
  Ac = class e extends yc {
    constructor() {
      let t = J(e.getDefaults(), arguments, [`frequency`]);
      (super(t),
        (this.name = `TickSource`),
        (this._state = new bc()),
        (this._tickOffset = new Rs()),
        (this._ticksAtTime = new Rs()),
        (this._secondsAtTime = new Rs()),
        (this.frequency = new kc({
          context: this.context,
          units: t.units,
          value: t.frequency,
        })),
        Y(this, `frequency`),
        this._state.setStateAtTime(`stopped`, 0),
        this.setTicksAtTime(0, 0));
    }
    static getDefaults() {
      return Object.assign({ frequency: 1, units: `hertz` }, yc.getDefaults());
    }
    get state() {
      return this.getStateAtTime(this.now());
    }
    start(e, t) {
      let n = this.toSeconds(e);
      return (
        this._state.getValueAtTime(n) !== `started` &&
          (this._state.setStateAtTime(`started`, n),
          G(t) && this.setTicksAtTime(t, n),
          this._ticksAtTime.cancel(n),
          this._secondsAtTime.cancel(n)),
        this
      );
    }
    stop(e) {
      let t = this.toSeconds(e);
      if (this._state.getValueAtTime(t) === `stopped`) {
        let e = this._state.get(t);
        e && e.time > 0 && (this._tickOffset.cancel(e.time), this._state.cancel(e.time));
      }
      return (
        this._state.cancel(t),
        this._state.setStateAtTime(`stopped`, t),
        this.setTicksAtTime(0, t),
        this._ticksAtTime.cancel(t),
        this._secondsAtTime.cancel(t),
        this
      );
    }
    pause(e) {
      let t = this.toSeconds(e);
      return (
        this._state.getValueAtTime(t) === `started` &&
          (this._state.setStateAtTime(`paused`, t),
          this._ticksAtTime.cancel(t),
          this._secondsAtTime.cancel(t)),
        this
      );
    }
    cancel(e) {
      return (
        (e = this.toSeconds(e)),
        this._state.cancel(e),
        this._tickOffset.cancel(e),
        this._ticksAtTime.cancel(e),
        this._secondsAtTime.cancel(e),
        this
      );
    }
    getTicksAtTime(e) {
      let t = this.toSeconds(e),
        n = this._state.getLastState(`stopped`, t),
        r = this._ticksAtTime.get(t),
        i = { state: `paused`, time: t };
      this._state.add(i);
      let a = r || n,
        o = r ? r.ticks : 0,
        s = null;
      return (
        this._state.forEachBetween(a.time, t + this.sampleTime, (e) => {
          let t = a.time,
            n = this._tickOffset.get(e.time);
          (n && n.time >= a.time && ((o = n.ticks), (t = n.time)),
            a.state === `started` &&
              e.state !== `started` &&
              ((o +=
                this.frequency.getTicksAtTime(e.time) - this.frequency.getTicksAtTime(t)),
              e.time !== i.time && (s = { state: e.state, time: e.time, ticks: o })),
            (a = e));
        }),
        this._state.remove(i),
        s && this._ticksAtTime.add(s),
        o
      );
    }
    get ticks() {
      return this.getTicksAtTime(this.now());
    }
    set ticks(e) {
      this.setTicksAtTime(e, this.now());
    }
    get seconds() {
      return this.getSecondsAtTime(this.now());
    }
    set seconds(e) {
      let t = this.now(),
        n = this.frequency.timeToTicks(e, t);
      this.setTicksAtTime(n, t);
    }
    getSecondsAtTime(e) {
      e = this.toSeconds(e);
      let t = this._state.getLastState(`stopped`, e),
        n = { state: `paused`, time: e };
      this._state.add(n);
      let r = this._secondsAtTime.get(e),
        i = r || t,
        a = r ? r.seconds : 0,
        o = null;
      return (
        this._state.forEachBetween(i.time, e + this.sampleTime, (e) => {
          let t = i.time,
            r = this._tickOffset.get(e.time);
          (r && r.time >= i.time && ((a = r.seconds), (t = r.time)),
            i.state === `started` &&
              e.state !== `started` &&
              ((a += e.time - t),
              e.time !== n.time && (o = { state: e.state, time: e.time, seconds: a })),
            (i = e));
        }),
        this._state.remove(n),
        o && this._secondsAtTime.add(o),
        a
      );
    }
    setTicksAtTime(e, t) {
      return (
        (t = this.toSeconds(t)),
        this._tickOffset.cancel(t),
        this._tickOffset.add({
          seconds: this.frequency.getDurationOfTicks(e, t),
          ticks: e,
          time: t,
        }),
        this._ticksAtTime.cancel(t),
        this._secondsAtTime.cancel(t),
        this
      );
    }
    getStateAtTime(e) {
      return ((e = this.toSeconds(e)), this._state.getValueAtTime(e));
    }
    getTimeOfTick(e, t = this.now()) {
      let n = this._tickOffset.get(t),
        r = this._state.get(t),
        i = Math.max(n.time, r.time),
        a = this.frequency.getTicksAtTime(i) + e - n.ticks;
      return this.frequency.getTimeOfTick(a);
    }
    forEachTickBetween(e, t, n) {
      let r = this._state.get(e);
      this._state.forEachBetween(e, t, (t) => {
        (r &&
          r.state === `started` &&
          t.state !== `started` &&
          this.forEachTickBetween(Math.max(r.time, e), t.time - this.sampleTime, n),
          (r = t));
      });
      let i = null;
      if (r && r.state === `started`) {
        let a = Math.max(r.time, e),
          o = this.frequency.getTicksAtTime(a),
          s = o - this.frequency.getTicksAtTime(r.time),
          c = Math.ceil(s) - s;
        c = Is(c, 1) ? 0 : c;
        let l = this.frequency.getTimeOfTick(o + c);
        for (; l < t;) {
          try {
            n(l, Math.round(this.getTicksAtTime(l)));
          } catch (e) {
            i = e;
            break;
          }
          l += this.frequency.getDurationOfTicks(1, l);
        }
      }
      if (i) throw i;
      return this;
    }
    dispose() {
      return (
        super.dispose(),
        this._state.dispose(),
        this._tickOffset.dispose(),
        this._ticksAtTime.dispose(),
        this._secondsAtTime.dispose(),
        this.frequency.dispose(),
        this
      );
    }
  },
  jc = class e extends yc {
    constructor() {
      let t = J(e.getDefaults(), arguments, [`callback`, `frequency`]);
      (super(t),
        (this.name = `Clock`),
        (this.callback = X),
        (this._lastUpdate = 0),
        (this._state = new bc(`stopped`)),
        (this._boundLoop = this._loop.bind(this)),
        (this.callback = t.callback),
        (this._tickSource = new Ac({
          context: this.context,
          frequency: t.frequency,
          units: t.units,
        })),
        (this._lastUpdate = 0),
        (this.frequency = this._tickSource.frequency),
        Y(this, `frequency`),
        this._state.setStateAtTime(`stopped`, 0),
        this.context.on(`tick`, this._boundLoop));
    }
    static getDefaults() {
      return Object.assign(yc.getDefaults(), {
        callback: X,
        frequency: 1,
        units: `hertz`,
      });
    }
    get state() {
      return this._state.getValueAtTime(this.now());
    }
    start(e, t) {
      as(this.context);
      let n = this.toSeconds(e);
      return (
        this.log(`start`, n),
        this._state.getValueAtTime(n) !== `started` &&
          (this._state.setStateAtTime(`started`, n),
          this._tickSource.start(n, t),
          n < this._lastUpdate && this.emit(`start`, n, t)),
        this
      );
    }
    stop(e) {
      let t = this.toSeconds(e);
      return (
        this.log(`stop`, t),
        this._state.cancel(t),
        this._state.setStateAtTime(`stopped`, t),
        this._tickSource.stop(t),
        t < this._lastUpdate && this.emit(`stop`, t),
        this
      );
    }
    pause(e) {
      let t = this.toSeconds(e);
      return (
        this._state.getValueAtTime(t) === `started` &&
          (this._state.setStateAtTime(`paused`, t),
          this._tickSource.pause(t),
          t < this._lastUpdate && this.emit(`pause`, t)),
        this
      );
    }
    get ticks() {
      return Math.ceil(this.getTicksAtTime(this.now()));
    }
    set ticks(e) {
      this._tickSource.ticks = e;
    }
    get seconds() {
      return this._tickSource.seconds;
    }
    set seconds(e) {
      this._tickSource.seconds = e;
    }
    getSecondsAtTime(e) {
      return this._tickSource.getSecondsAtTime(e);
    }
    setTicksAtTime(e, t) {
      return (this._tickSource.setTicksAtTime(e, t), this);
    }
    getTimeOfTick(e, t = this.now()) {
      return this._tickSource.getTimeOfTick(e, t);
    }
    getTicksAtTime(e) {
      return this._tickSource.getTicksAtTime(e);
    }
    nextTickTime(e, t) {
      let n = this.toSeconds(t),
        r = this.getTicksAtTime(n);
      return this._tickSource.getTimeOfTick(r + e, n);
    }
    _loop() {
      let e = this._lastUpdate,
        t = this.now();
      ((this._lastUpdate = t),
        this.log(`loop`, e, t),
        e !== t &&
          (this._state.forEachBetween(e, t, (e) => {
            switch (e.state) {
              case `started`:
                let t = this._tickSource.getTicksAtTime(e.time);
                this.emit(`start`, e.time, t);
                break;
              case `stopped`:
                e.time !== 0 && this.emit(`stop`, e.time);
                break;
              case `paused`:
                this.emit(`pause`, e.time);
                break;
            }
          }),
          this._tickSource.forEachTickBetween(e, t, (e, t) => {
            this.callback(e, t);
          })));
    }
    getStateAtTime(e) {
      let t = this.toSeconds(e);
      return this._state.getValueAtTime(t);
    }
    dispose() {
      return (
        super.dispose(),
        this.context.off(`tick`, this._boundLoop),
        this._tickSource.dispose(),
        this._state.dispose(),
        this
      );
    }
  };
Gs.mixin(jc);
var Mc = class e extends Q {
    constructor() {
      let t = J(e.getDefaults(), arguments, [`volume`]);
      (super(t),
        (this.name = `Volume`),
        (this.input = this.output =
          new wc({ context: this.context, gain: t.volume, units: `decibels` })),
        (this.volume = this.output.gain),
        Y(this, `volume`),
        (this._unmutedVolume = t.volume),
        (this.mute = t.mute));
    }
    static getDefaults() {
      return Object.assign(Q.getDefaults(), { mute: !1, volume: 0 });
    }
    get mute() {
      return this.volume.value === -1 / 0;
    }
    set mute(e) {
      !this.mute && e
        ? ((this._unmutedVolume = this.volume.value), (this.volume.value = -1 / 0))
        : this.mute && !e && (this.volume.value = this._unmutedVolume);
    }
    dispose() {
      return (super.dispose(), this.input.dispose(), this.volume.dispose(), this);
    }
  },
  Nc = class e extends Q {
    constructor() {
      let t = J(e.getDefaults(), arguments);
      (super(t),
        (this.name = `Destination`),
        (this.input = new Mc({ context: this.context })),
        (this.output = new wc({ context: this.context })),
        (this.volume = this.input.volume),
        xc(this.input, this.output, this.context.rawContext.destination),
        (this.mute = t.mute),
        (this._internalChannels = [
          this.input,
          this.context.rawContext.destination,
          this.output,
        ]));
    }
    static getDefaults() {
      return Object.assign(Q.getDefaults(), { mute: !1, volume: 0 });
    }
    get mute() {
      return this.input.mute;
    }
    set mute(e) {
      this.input.mute = e;
    }
    chain(...e) {
      return (
        this.input.disconnect(),
        e.unshift(this.input),
        e.push(this.output),
        xc(...e),
        this
      );
    }
    get maxChannelCount() {
      return this.context.rawContext.destination.maxChannelCount;
    }
    dispose() {
      return (super.dispose(), this.volume.dispose(), this);
    }
  };
(Bs((e) => {
  e.destination = new Nc({ context: e });
}),
  Us((e) => {
    e.destination.dispose();
  }));
var Pc = class extends Q {
  constructor() {
    (super(...arguments),
      (this.name = `Listener`),
      (this.positionX = new Z({
        context: this.context,
        param: this.context.rawContext.listener.positionX,
      })),
      (this.positionY = new Z({
        context: this.context,
        param: this.context.rawContext.listener.positionY,
      })),
      (this.positionZ = new Z({
        context: this.context,
        param: this.context.rawContext.listener.positionZ,
      })),
      (this.forwardX = new Z({
        context: this.context,
        param: this.context.rawContext.listener.forwardX,
      })),
      (this.forwardY = new Z({
        context: this.context,
        param: this.context.rawContext.listener.forwardY,
      })),
      (this.forwardZ = new Z({
        context: this.context,
        param: this.context.rawContext.listener.forwardZ,
      })),
      (this.upX = new Z({
        context: this.context,
        param: this.context.rawContext.listener.upX,
      })),
      (this.upY = new Z({
        context: this.context,
        param: this.context.rawContext.listener.upY,
      })),
      (this.upZ = new Z({
        context: this.context,
        param: this.context.rawContext.listener.upZ,
      })));
  }
  static getDefaults() {
    return Object.assign(Q.getDefaults(), {
      positionX: 0,
      positionY: 0,
      positionZ: 0,
      forwardX: 0,
      forwardY: 0,
      forwardZ: -1,
      upX: 0,
      upY: 1,
      upZ: 0,
    });
  }
  dispose() {
    return (
      super.dispose(),
      this.positionX.dispose(),
      this.positionY.dispose(),
      this.positionZ.dispose(),
      this.forwardX.dispose(),
      this.forwardY.dispose(),
      this.forwardZ.dispose(),
      this.upX.dispose(),
      this.upY.dispose(),
      this.upZ.dispose(),
      this
    );
  }
};
(Bs((e) => {
  e.listener = new Pc({ context: e });
}),
  Us((e) => {
    e.listener.dispose();
  }));
var Fc = class e extends js {
    constructor() {
      (super(),
        (this.name = `ToneAudioBuffers`),
        (this._buffers = new Map()),
        (this._loadingCount = 0));
      let t = J(e.getDefaults(), arguments, [`urls`, `onload`, `baseUrl`], `urls`);
      ((this.baseUrl = t.baseUrl),
        Object.keys(t.urls).forEach((e) => {
          this._loadingCount++;
          let n = t.urls[e];
          this.add(e, n, this._bufferLoaded.bind(this, t.onload), t.onerror);
        }));
    }
    static getDefaults() {
      return { baseUrl: ``, onerror: X, onload: X, urls: {} };
    }
    has(e) {
      return this._buffers.has(e.toString());
    }
    get(e) {
      return (
        K(this.has(e), `ToneAudioBuffers has no buffer named: ${e}`),
        this._buffers.get(e.toString())
      );
    }
    _bufferLoaded(e) {
      (this._loadingCount--, this._loadingCount === 0 && e && e());
    }
    get loaded() {
      return Array.from(this._buffers).every(([e, t]) => t.loaded);
    }
    add(e, t, n = X, r = X) {
      return (
        ns(t)
          ? (this.baseUrl &&
              t.trim().substring(0, 11).toLowerCase() === `data:audio/` &&
              (this.baseUrl = ``),
            this._buffers.set(e.toString(), new Xs(this.baseUrl + t, n, r)))
          : this._buffers.set(e.toString(), new Xs(t, n, r)),
        this
      );
    }
    dispose() {
      return (
        super.dispose(),
        this._buffers.forEach((e) => e.dispose()),
        this._buffers.clear(),
        this
      );
    }
  },
  Ic = class extends vc {
    constructor() {
      (super(...arguments), (this.name = `Ticks`), (this.defaultUnits = `i`));
    }
    _now() {
      return this.context.transport.ticks;
    }
    _beatsToUnits(e) {
      return this._getPPQ() * e;
    }
    _secondsToUnits(e) {
      return Math.floor((e / (60 / this._getBpm())) * this._getPPQ());
    }
    _ticksToUnits(e) {
      return e;
    }
    toTicks() {
      return this.valueOf();
    }
    toSeconds() {
      return (this.valueOf() / this._getPPQ()) * (60 / this._getBpm());
    }
  },
  Lc = class extends yc {
    constructor() {
      (super(...arguments),
        (this.name = `Draw`),
        (this.expiration = 0.25),
        (this.anticipation = 0.008),
        (this._events = new Rs()),
        (this._boundDrawLoop = this._drawLoop.bind(this)),
        (this._animationFrame = -1));
    }
    schedule(e, t) {
      return (
        this._events.add({ callback: e, time: this.toSeconds(t) }),
        this._events.length === 1 &&
          (this._animationFrame = requestAnimationFrame(this._boundDrawLoop)),
        this
      );
    }
    cancel(e) {
      return (this._events.cancel(this.toSeconds(e)), this);
    }
    _drawLoop() {
      let e = this.context.currentTime;
      (this._events.forEachBefore(e + this.anticipation, (t) => {
        (e - t.time <= this.expiration && t.callback(), this._events.remove(t));
      }),
        this._events.length > 0 &&
          (this._animationFrame = requestAnimationFrame(this._boundDrawLoop)));
    }
    dispose() {
      return (
        super.dispose(),
        this._events.dispose(),
        cancelAnimationFrame(this._animationFrame),
        this
      );
    }
  };
(Bs((e) => {
  e.draw = new Lc({ context: e });
}),
  Us((e) => {
    e.draw.dispose();
  }));
var Rc = class extends js {
    constructor() {
      (super(...arguments),
        (this.name = `IntervalTimeline`),
        (this._root = null),
        (this._length = 0));
    }
    add(e) {
      (K(G(e.time), `Events must have a time property`),
        K(G(e.duration), `Events must have a duration parameter`),
        (e.time = e.time.valueOf()));
      let t = new zc(e.time, e.time + e.duration, e);
      for (
        this._root === null ? (this._root = t) : this._root.insert(t), this._length++;
        t !== null;
      )
        (t.updateHeight(), t.updateMax(), this._rebalance(t), (t = t.parent));
      return this;
    }
    remove(e) {
      if (this._root !== null) {
        let t = [];
        this._root.search(e.time, t);
        for (let n of t)
          if (n.event === e) {
            (this._removeNode(n), this._length--);
            break;
          }
      }
      return this;
    }
    get length() {
      return this._length;
    }
    cancel(e) {
      return (this.forEachFrom(e, (e) => this.remove(e)), this);
    }
    _setRoot(e) {
      ((this._root = e), this._root !== null && (this._root.parent = null));
    }
    _replaceNodeInParent(e, t) {
      e.parent === null
        ? this._setRoot(t)
        : (e.isLeftChild() ? (e.parent.left = t) : (e.parent.right = t),
          this._rebalance(e.parent));
    }
    _removeNode(e) {
      if (e.left === null && e.right === null) this._replaceNodeInParent(e, null);
      else if (e.right === null) this._replaceNodeInParent(e, e.left);
      else if (e.left === null) this._replaceNodeInParent(e, e.right);
      else {
        let t = e.getBalance(),
          n,
          r = null;
        if (t > 0)
          if (e.left.right === null) ((n = e.left), (n.right = e.right), (r = n));
          else {
            for (n = e.left.right; n.right !== null;) n = n.right;
            n.parent &&
              ((n.parent.right = n.left),
              (r = n.parent),
              (n.left = e.left),
              (n.right = e.right));
          }
        else if (e.right.left === null) ((n = e.right), (n.left = e.left), (r = n));
        else {
          for (n = e.right.left; n.left !== null;) n = n.left;
          n.parent &&
            ((n.parent.left = n.right),
            (r = n.parent),
            (n.left = e.left),
            (n.right = e.right));
        }
        (e.parent === null
          ? this._setRoot(n)
          : e.isLeftChild()
            ? (e.parent.left = n)
            : (e.parent.right = n),
          r && this._rebalance(r));
      }
      e.dispose();
    }
    _rotateLeft(e) {
      let t = e.parent,
        n = e.isLeftChild(),
        r = e.right;
      (r && ((e.right = r.left), (r.left = e)),
        t === null ? this._setRoot(r) : n ? (t.left = r) : (t.right = r));
    }
    _rotateRight(e) {
      let t = e.parent,
        n = e.isLeftChild(),
        r = e.left;
      (r && ((e.left = r.right), (r.right = e)),
        t === null ? this._setRoot(r) : n ? (t.left = r) : (t.right = r));
    }
    _rebalance(e) {
      let t = e.getBalance();
      t > 1 && e.left
        ? e.left.getBalance() < 0
          ? this._rotateLeft(e.left)
          : this._rotateRight(e)
        : t < -1 &&
          e.right &&
          (e.right.getBalance() > 0 ? this._rotateRight(e.right) : this._rotateLeft(e));
    }
    get(e) {
      if (this._root !== null) {
        let t = [];
        if ((this._root.search(e, t), t.length > 0)) {
          let e = t[0];
          for (let n = 1; n < t.length; n++) t[n].low > e.low && (e = t[n]);
          return e.event;
        }
      }
      return null;
    }
    forEach(e) {
      if (this._root !== null) {
        let t = [];
        (this._root.traverse((e) => t.push(e)),
          t.forEach((t) => {
            t.event && e(t.event);
          }));
      }
      return this;
    }
    forEachAtTime(e, t) {
      if (this._root !== null) {
        let n = [];
        (this._root.search(e, n),
          n.forEach((e) => {
            e.event && t(e.event);
          }));
      }
      return this;
    }
    forEachFrom(e, t) {
      if (this._root !== null) {
        let n = [];
        (this._root.searchAfter(e, n),
          n.forEach((e) => {
            e.event && t(e.event);
          }));
      }
      return this;
    }
    dispose() {
      return (
        super.dispose(),
        this._root !== null && this._root.traverse((e) => e.dispose()),
        (this._root = null),
        this
      );
    }
  },
  zc = class {
    constructor(e, t, n) {
      ((this._left = null),
        (this._right = null),
        (this.parent = null),
        (this.height = 0),
        (this.event = n),
        (this.low = e),
        (this.high = t),
        (this.max = this.high));
    }
    insert(e) {
      e.low <= this.low
        ? this.left === null
          ? (this.left = e)
          : this.left.insert(e)
        : this.right === null
          ? (this.right = e)
          : this.right.insert(e);
    }
    search(e, t) {
      e > this.max ||
        (this.left !== null && this.left.search(e, t),
        this.low <= e && this.high > e && t.push(this),
        !(this.low > e) && this.right !== null && this.right.search(e, t));
    }
    searchAfter(e, t) {
      (this.low >= e && (t.push(this), this.left !== null && this.left.searchAfter(e, t)),
        this.right !== null && this.right.searchAfter(e, t));
    }
    traverse(e) {
      (e(this),
        this.left !== null && this.left.traverse(e),
        this.right !== null && this.right.traverse(e));
    }
    updateHeight() {
      this.left !== null && this.right !== null
        ? (this.height = Math.max(this.left.height, this.right.height) + 1)
        : this.right === null
          ? this.left === null
            ? (this.height = 0)
            : (this.height = this.left.height + 1)
          : (this.height = this.right.height + 1);
    }
    updateMax() {
      ((this.max = this.high),
        this.left !== null && (this.max = Math.max(this.max, this.left.max)),
        this.right !== null && (this.max = Math.max(this.max, this.right.max)));
    }
    getBalance() {
      let e = 0;
      return (
        this.left !== null && this.right !== null
          ? (e = this.left.height - this.right.height)
          : this.left === null
            ? this.right !== null && (e = -(this.right.height + 1))
            : (e = this.left.height + 1),
        e
      );
    }
    isLeftChild() {
      return this.parent !== null && this.parent.left === this;
    }
    get left() {
      return this._left;
    }
    set left(e) {
      ((this._left = e),
        e !== null && (e.parent = this),
        this.updateHeight(),
        this.updateMax());
    }
    get right() {
      return this._right;
    }
    set right(e) {
      ((this._right = e),
        e !== null && (e.parent = this),
        this.updateHeight(),
        this.updateMax());
    }
    dispose() {
      ((this.parent = null),
        (this._left = null),
        (this._right = null),
        (this.event = null));
    }
  },
  Bc = class extends js {
    constructor(e) {
      (super(),
        (this.name = `TimelineValue`),
        (this._timeline = new Rs({ memory: 10 })),
        (this._initialValue = e));
    }
    set(e, t) {
      return (this._timeline.add({ value: e, time: t }), this);
    }
    get(e) {
      let t = this._timeline.get(e);
      return t ? t.value : this._initialValue;
    }
  },
  Vc = class e extends Q {
    constructor() {
      super(J(e.getDefaults(), arguments, [`context`]));
    }
    connect(e, t = 0, n = 0) {
      return (Dc(this, e, t, n), this);
    }
  },
  Hc = class e extends Vc {
    constructor() {
      let t = J(e.getDefaults(), arguments, [`mapping`, `length`]);
      (super(t),
        (this.name = `WaveShaper`),
        (this._shaper = this.context.createWaveShaper()),
        (this.input = this._shaper),
        (this.output = this._shaper),
        ts(t.mapping) || t.mapping instanceof Float32Array
          ? (this.curve = Float32Array.from(t.mapping))
          : Zo(t.mapping) && this.setMap(t.mapping, t.length));
    }
    static getDefaults() {
      return Object.assign($.getDefaults(), { length: 1024 });
    }
    setMap(e, t = 1024) {
      let n = new Float32Array(t);
      for (let r = 0, i = t; r < i; r++) n[r] = e((r / (i - 1)) * 2 - 1, r);
      return ((this.curve = n), this);
    }
    get curve() {
      return this._shaper.curve;
    }
    set curve(e) {
      this._shaper.curve = e;
    }
    get oversample() {
      return this._shaper.oversample;
    }
    set oversample(e) {
      (K(
        [`none`, `2x`, `4x`].some((t) => t.includes(e)),
        `oversampling must be either 'none', '2x', or '4x'`,
      ),
        (this._shaper.oversample = e));
    }
    dispose() {
      return (super.dispose(), this._shaper.disconnect(), this);
    }
  },
  Uc = class e extends Vc {
    constructor() {
      let t = J(e.getDefaults(), arguments, [`value`]);
      (super(t),
        (this.name = `Pow`),
        (this._exponentScaler =
          this.input =
          this.output =
            new Hc({
              context: this.context,
              mapping: this._expFunc(t.value),
              length: 8192,
            })),
        (this._exponent = t.value));
    }
    static getDefaults() {
      return Object.assign(Vc.getDefaults(), { value: 1 });
    }
    _expFunc(e) {
      return (t) => Math.abs(t) ** +e;
    }
    get value() {
      return this._exponent;
    }
    set value(e) {
      ((this._exponent = e), this._exponentScaler.setMap(this._expFunc(this._exponent)));
    }
    dispose() {
      return (super.dispose(), this._exponentScaler.dispose(), this);
    }
  },
  Wc = class e {
    constructor(t, n) {
      ((this.id = e._eventId++), (this._remainderTime = 0));
      let r = Object.assign(e.getDefaults(), n);
      ((this.transport = t),
        (this.callback = r.callback),
        (this._once = r.once),
        (this.time = Math.floor(r.time)),
        (this._remainderTime = r.time - this.time));
    }
    static getDefaults() {
      return { callback: X, once: !1, time: 0 };
    }
    get floatTime() {
      return this.time + this._remainderTime;
    }
    invoke(e) {
      if (this.callback) {
        let t = this.transport.bpm.getDurationOfTicks(1, e);
        (this.callback(e + this._remainderTime * t),
          this._once && this.transport.clear(this.id));
      }
    }
    dispose() {
      return ((this.callback = void 0), this);
    }
  };
Wc._eventId = 0;
var Gc = class e extends Wc {
    constructor(t, n) {
      (super(t, n),
        (this._currentId = -1),
        (this._nextId = -1),
        (this._nextTick = this.time),
        (this._boundRestart = this._restart.bind(this)));
      let r = Object.assign(e.getDefaults(), n);
      ((this.duration = r.duration),
        (this._interval = r.interval),
        (this._nextTick = r.time),
        this.transport.on(`start`, this._boundRestart),
        this.transport.on(`loopStart`, this._boundRestart),
        this.transport.on(`ticks`, this._boundRestart),
        (this.context = this.transport.context),
        this._restart());
    }
    static getDefaults() {
      return Object.assign({}, Wc.getDefaults(), {
        duration: 1 / 0,
        interval: 1,
        once: !1,
      });
    }
    invoke(e) {
      (this._createEvents(e), super.invoke(e));
    }
    _createEvent() {
      return Fs(this._nextTick, this.floatTime + this.duration)
        ? this.transport.scheduleOnce(
            this.invoke.bind(this),
            new Ic(this.context, this._nextTick).toSeconds(),
          )
        : -1;
    }
    _createEvents(e) {
      Fs(this._nextTick + this._interval, this.floatTime + this.duration) &&
        ((this._nextTick += this._interval),
        (this._currentId = this._nextId),
        (this._nextId = this.transport.scheduleOnce(
          this.invoke.bind(this),
          new Ic(this.context, this._nextTick).toSeconds(),
        )));
    }
    _restart(e) {
      (this.transport.clear(this._currentId),
        this.transport.clear(this._nextId),
        (this._nextTick = this.floatTime));
      let t = this.transport.getTicksAtTime(e);
      (Ns(t, this.time) &&
        (this._nextTick =
          this.floatTime +
          Math.ceil((t - this.floatTime) / this._interval) * this._interval),
        (this._currentId = this._createEvent()),
        (this._nextTick += this._interval),
        (this._nextId = this._createEvent()));
    }
    dispose() {
      return (
        super.dispose(),
        this.transport.clear(this._currentId),
        this.transport.clear(this._nextId),
        this.transport.off(`start`, this._boundRestart),
        this.transport.off(`loopStart`, this._boundRestart),
        this.transport.off(`ticks`, this._boundRestart),
        this
      );
    }
  },
  Kc = class e extends yc {
    constructor() {
      let t = J(e.getDefaults(), arguments);
      (super(t),
        (this.name = `Transport`),
        (this._loop = new Bc(!1)),
        (this._loopStart = 0),
        (this._loopEnd = 0),
        (this._scheduledEvents = {}),
        (this._timeline = new Rs()),
        (this._repeatedEvents = new Rc()),
        (this._syncedSignals = []),
        (this._swingAmount = 0),
        (this._ppq = t.ppq),
        (this._clock = new jc({
          callback: this._processTick.bind(this),
          context: this.context,
          frequency: 0,
          units: `bpm`,
        })),
        this._bindClockEvents(),
        (this.bpm = this._clock.frequency),
        (this._clock.frequency.multiplier = t.ppq),
        this.bpm.setValueAtTime(t.bpm, 0),
        Y(this, `bpm`),
        (this._timeSignature = t.timeSignature),
        (this._swingTicks = t.ppq / 2));
    }
    static getDefaults() {
      return Object.assign(yc.getDefaults(), {
        bpm: 120,
        loopEnd: `4m`,
        loopStart: 0,
        ppq: 192,
        swing: 0,
        swingSubdivision: `8n`,
        timeSignature: 4,
      });
    }
    _processTick(e, t) {
      if (
        (this._loop.get(e) &&
          t >= this._loopEnd &&
          (this.emit(`loopEnd`, e),
          this._clock.setTicksAtTime(this._loopStart, e),
          (t = this._loopStart),
          this.emit(`loopStart`, e, this._clock.getSecondsAtTime(e)),
          this.emit(`loop`, e)),
        this._swingAmount > 0 && t % this._ppq !== 0 && t % (this._swingTicks * 2) != 0)
      ) {
        let n = (t % (this._swingTicks * 2)) / (this._swingTicks * 2),
          r = Math.sin(n * Math.PI) * this._swingAmount;
        e += new Ic(this.context, (this._swingTicks * 2) / 3).toSeconds() * r;
      }
      (cs(!0), this._timeline.forEachAtTime(t, (t) => t.invoke(e)), cs(!1));
    }
    schedule(e, t) {
      let n = new Wc(this, { callback: e, time: new vc(this.context, t).toTicks() });
      return this._addEvent(n, this._timeline);
    }
    scheduleRepeat(e, t, n, r = 1 / 0) {
      let i = new Gc(this, {
        callback: e,
        duration: new pc(this.context, r).toTicks(),
        interval: new pc(this.context, t).toTicks(),
        time: new vc(this.context, n).toTicks(),
      });
      return this._addEvent(i, this._repeatedEvents);
    }
    scheduleOnce(e, t) {
      let n = new Wc(this, {
        callback: e,
        once: !0,
        time: new vc(this.context, t).toTicks(),
      });
      return this._addEvent(n, this._timeline);
    }
    clear(e) {
      if (this._scheduledEvents.hasOwnProperty(e)) {
        let t = this._scheduledEvents[e.toString()];
        (t.timeline.remove(t.event),
          t.event.dispose(),
          delete this._scheduledEvents[e.toString()]);
      }
      return this;
    }
    _addEvent(e, t) {
      return (
        (this._scheduledEvents[e.id.toString()] = { event: e, timeline: t }),
        t.add(e),
        e.id
      );
    }
    cancel(e = 0) {
      let t = this.toTicks(e);
      return (
        this._timeline.forEachFrom(t, (e) => this.clear(e.id)),
        this._repeatedEvents.forEachFrom(t, (e) => this.clear(e.id)),
        this
      );
    }
    _bindClockEvents() {
      (this._clock.on(`start`, (e, t) => {
        ((t = new Ic(this.context, t).toSeconds()), this.emit(`start`, e, t));
      }),
        this._clock.on(`stop`, (e) => {
          this.emit(`stop`, e);
        }),
        this._clock.on(`pause`, (e) => {
          this.emit(`pause`, e);
        }));
    }
    get state() {
      return this._clock.getStateAtTime(this.now());
    }
    start(e, t) {
      this.context.resume();
      let n;
      return (G(t) && (n = this.toTicks(t)), this._clock.start(e, n), this);
    }
    stop(e) {
      return (this._clock.stop(e), this);
    }
    pause(e) {
      return (this._clock.pause(e), this);
    }
    toggle(e) {
      return (
        (e = this.toSeconds(e)),
        this._clock.getStateAtTime(e) === `started` ? this.stop(e) : this.start(e),
        this
      );
    }
    get timeSignature() {
      return this._timeSignature;
    }
    set timeSignature(e) {
      (ts(e) && (e = (e[0] / e[1]) * 4), (this._timeSignature = e));
    }
    get loopStart() {
      return new pc(this.context, this._loopStart, `i`).toSeconds();
    }
    set loopStart(e) {
      this._loopStart = this.toTicks(e);
    }
    get loopEnd() {
      return new pc(this.context, this._loopEnd, `i`).toSeconds();
    }
    set loopEnd(e) {
      this._loopEnd = this.toTicks(e);
    }
    get loop() {
      return this._loop.get(this.now());
    }
    set loop(e) {
      this._loop.set(e, this.now());
    }
    setLoopPoints(e, t) {
      return ((this.loopStart = e), (this.loopEnd = t), this);
    }
    get swing() {
      return this._swingAmount;
    }
    set swing(e) {
      this._swingAmount = e;
    }
    get swingSubdivision() {
      return new Ic(this.context, this._swingTicks).toNotation();
    }
    set swingSubdivision(e) {
      this._swingTicks = this.toTicks(e);
    }
    get position() {
      let e = this.now(),
        t = this._clock.getTicksAtTime(e);
      return new Ic(this.context, t).toBarsBeatsSixteenths();
    }
    set position(e) {
      let t = this.toTicks(e);
      this.ticks = t;
    }
    get seconds() {
      return this._clock.seconds;
    }
    set seconds(e) {
      let t = this.now(),
        n = this._clock.frequency.timeToTicks(e, t);
      this.ticks = n;
    }
    get progress() {
      if (this.loop) {
        let e = this.now();
        return (
          (this._clock.getTicksAtTime(e) - this._loopStart) /
          (this._loopEnd - this._loopStart)
        );
      } else return 0;
    }
    get ticks() {
      return this._clock.ticks;
    }
    set ticks(e) {
      if (this._clock.ticks !== e) {
        let t = this.now();
        if (this.state === `started`) {
          let n = this._clock.getTicksAtTime(t),
            r = t + this._clock.frequency.getDurationOfTicks(Math.ceil(n) - n, t);
          (this.emit(`stop`, r),
            this._clock.setTicksAtTime(e, r),
            this.emit(`start`, r, this._clock.getSecondsAtTime(r)));
        } else (this.emit(`ticks`, t), this._clock.setTicksAtTime(e, t));
      }
    }
    getTicksAtTime(e) {
      return this._clock.getTicksAtTime(e);
    }
    getSecondsAtTime(e) {
      return this._clock.getSecondsAtTime(e);
    }
    get PPQ() {
      return this._clock.frequency.multiplier;
    }
    set PPQ(e) {
      this._clock.frequency.multiplier = e;
    }
    nextSubdivision(e) {
      if (((e = this.toTicks(e)), this.state !== `started`)) return 0;
      {
        let t = this.now(),
          n = this.getTicksAtTime(t),
          r = e - (n % e);
        return this._clock.nextTickTime(r, t);
      }
    }
    syncSignal(e, t) {
      let n = this.now(),
        r = this.bpm,
        i = 1 / (60 / r.getValueAtTime(n) / this.PPQ),
        a = [];
      if (e.units === `time`) {
        let e = 1 / 64 / i,
          t = new wc(e),
          n = new Uc(-1),
          o = new wc(e);
        (r.chain(t, n, o), (r = o), (i = 1 / i), (a = [t, n, o]));
      }
      t ||= e.getValueAtTime(n) === 0 ? 0 : e.getValueAtTime(n) / i;
      let o = new wc(t);
      return (
        r.connect(o),
        o.connect(e._param),
        a.push(o),
        this._syncedSignals.push({ initial: e.value, nodes: a, signal: e }),
        (e.value = 0),
        this
      );
    }
    unsyncSignal(e) {
      for (let t = this._syncedSignals.length - 1; t >= 0; t--) {
        let n = this._syncedSignals[t];
        n.signal === e &&
          (n.nodes.forEach((e) => e.dispose()),
          (n.signal.value = n.initial),
          this._syncedSignals.splice(t, 1));
      }
      return this;
    }
    dispose() {
      return (
        super.dispose(),
        this._clock.dispose(),
        Ys(this, `bpm`),
        this._timeline.dispose(),
        this._repeatedEvents.dispose(),
        this
      );
    }
  };
(Gs.mixin(Kc),
  Bs((e) => {
    e.transport = new Kc({ context: e });
  }),
  Us((e) => {
    e.transport.dispose();
  }));
var qc = class extends Q {
    constructor(e) {
      (super(e),
        (this.input = void 0),
        (this._state = new bc(`stopped`)),
        (this._synced = !1),
        (this._scheduled = []),
        (this._syncedStart = X),
        (this._syncedStop = X),
        (this._state.memory = 100),
        (this._state.increasing = !0),
        (this._volume = this.output =
          new Mc({ context: this.context, mute: e.mute, volume: e.volume })),
        (this.volume = this._volume.volume),
        Y(this, `volume`),
        (this.onstop = e.onstop));
    }
    static getDefaults() {
      return Object.assign(Q.getDefaults(), { mute: !1, onstop: X, volume: 0 });
    }
    get state() {
      return this._synced
        ? this.context.transport.state === `started`
          ? this._state.getValueAtTime(this.context.transport.seconds)
          : `stopped`
        : this._state.getValueAtTime(this.now());
    }
    get mute() {
      return this._volume.mute;
    }
    set mute(e) {
      this._volume.mute = e;
    }
    _clampToCurrentTime(e) {
      return this._synced ? e : Math.max(e, this.context.currentTime);
    }
    start(e, t, n) {
      let r = Xo(e) && this._synced ? this.context.transport.seconds : this.toSeconds(e);
      if (
        ((r = this._clampToCurrentTime(r)),
        !this._synced && this._state.getValueAtTime(r) === `started`)
      )
        (K(
          Ns(r, this._state.get(r).time),
          `Start time must be strictly greater than previous start time`,
        ),
          this._state.cancel(r),
          this._state.setStateAtTime(`started`, r),
          this.log(`restart`, r),
          this.restart(r, t, n));
      else if (
        (this.log(`start`, r), this._state.setStateAtTime(`started`, r), this._synced)
      ) {
        let e = this._state.get(r);
        e &&
          ((e.offset = this.toSeconds(ks(t, 0))),
          (e.duration = n ? this.toSeconds(n) : void 0));
        let i = this.context.transport.schedule((e) => {
          this._start(e, t, n);
        }, r);
        (this._scheduled.push(i),
          this.context.transport.state === `started` &&
            this.context.transport.getSecondsAtTime(this.immediate()) > r &&
            this._syncedStart(this.now(), this.context.transport.seconds));
      } else (as(this.context), this._start(r, t, n));
      return this;
    }
    stop(e) {
      let t = Xo(e) && this._synced ? this.context.transport.seconds : this.toSeconds(e);
      if (
        ((t = this._clampToCurrentTime(t)),
        this._state.getValueAtTime(t) === `started` ||
          G(this._state.getNextState(`started`, t)))
      ) {
        if ((this.log(`stop`, t), !this._synced)) this._stop(t);
        else {
          let e = this.context.transport.schedule(this._stop.bind(this), t);
          this._scheduled.push(e);
        }
        (this._state.cancel(t), this._state.setStateAtTime(`stopped`, t));
      }
      return this;
    }
    restart(e, t, n) {
      return (
        (e = this.toSeconds(e)),
        this._state.getValueAtTime(e) === `started` &&
          (this._state.cancel(e), this._restart(e, t, n)),
        this
      );
    }
    sync() {
      return (
        this._synced ||
          ((this._synced = !0),
          (this._syncedStart = (e, t) => {
            if (Ns(t, 0)) {
              let n = this._state.get(t);
              if (n && n.state === `started` && n.time !== t) {
                let r = t - this.toSeconds(n.time),
                  i;
                (n.duration && (i = this.toSeconds(n.duration) - r),
                  this._start(e, this.toSeconds(n.offset) + r, i));
              }
            }
          }),
          (this._syncedStop = (e) => {
            let t = this.context.transport.getSecondsAtTime(
              Math.max(e - this.sampleTime, 0),
            );
            this._state.getValueAtTime(t) === `started` && this._stop(e);
          }),
          this.context.transport.on(`start`, this._syncedStart),
          this.context.transport.on(`loopStart`, this._syncedStart),
          this.context.transport.on(`stop`, this._syncedStop),
          this.context.transport.on(`pause`, this._syncedStop),
          this.context.transport.on(`loopEnd`, this._syncedStop)),
        this
      );
    }
    unsync() {
      return (
        this._synced &&
          (this.context.transport.off(`stop`, this._syncedStop),
          this.context.transport.off(`pause`, this._syncedStop),
          this.context.transport.off(`loopEnd`, this._syncedStop),
          this.context.transport.off(`start`, this._syncedStart),
          this.context.transport.off(`loopStart`, this._syncedStart)),
        (this._synced = !1),
        this._scheduled.forEach((e) => this.context.transport.clear(e)),
        (this._scheduled = []),
        this._state.cancel(0),
        this._stop(0),
        this
      );
    }
    dispose() {
      return (
        super.dispose(),
        (this.onstop = X),
        this.unsync(),
        this._volume.dispose(),
        this._state.dispose(),
        this
      );
    }
  },
  Jc = class e extends Tc {
    constructor() {
      let t = J(e.getDefaults(), arguments, [`url`, `onload`]);
      (super(t),
        (this.name = `ToneBufferSource`),
        (this._source = this.context.createBufferSource()),
        (this._internalChannels = [this._source]),
        (this._sourceStarted = !1),
        (this._sourceStopped = !1),
        Sc(this._source, this._gainNode),
        (this._source.onended = () => this._stopSource()),
        (this.playbackRate = new Z({
          context: this.context,
          param: this._source.playbackRate,
          units: `positive`,
          value: t.playbackRate,
        })),
        (this.loop = t.loop),
        (this.loopStart = t.loopStart),
        (this.loopEnd = t.loopEnd),
        (this._buffer = new Xs(t.url, t.onload, t.onerror)),
        this._internalChannels.push(this._source));
    }
    static getDefaults() {
      return Object.assign(Tc.getDefaults(), {
        url: new Xs(),
        loop: !1,
        loopEnd: 0,
        loopStart: 0,
        onload: X,
        onerror: X,
        playbackRate: 1,
      });
    }
    get fadeIn() {
      return this._fadeIn;
    }
    set fadeIn(e) {
      this._fadeIn = e;
    }
    get fadeOut() {
      return this._fadeOut;
    }
    set fadeOut(e) {
      this._fadeOut = e;
    }
    get curve() {
      return this._curve;
    }
    set curve(e) {
      this._curve = e;
    }
    start(e, t, n, r = 1) {
      K(this.buffer.loaded, `buffer is either not set or not loaded`);
      let i = this.toSeconds(e);
      (this._startGain(i, r), (t = this.loop ? ks(t, this.loopStart) : ks(t, 0)));
      let a = Math.max(this.toSeconds(t), 0);
      if (this.loop) {
        let e = this.toSeconds(this.loopEnd) || this.buffer.duration,
          t = this.toSeconds(this.loopStart),
          n = e - t;
        (Ps(a, e) && (a = ((a - t) % n) + t), Is(a, this.buffer.duration) && (a = 0));
      }
      if (
        ((this._source.buffer = this.buffer.get()),
        (this._source.loopEnd = this.toSeconds(this.loopEnd) || this.buffer.duration),
        Fs(a, this.buffer.duration) &&
          ((this._sourceStarted = !0), this._source.start(i, a)),
        G(n))
      ) {
        let e = this.toSeconds(n);
        ((e = Math.max(e, 0)), this.stop(i + e));
      }
      return this;
    }
    _stopSource(e) {
      !this._sourceStopped &&
        this._sourceStarted &&
        ((this._sourceStopped = !0),
        this._source.stop(this.toSeconds(e)),
        this._onended());
    }
    get loopStart() {
      return this._source.loopStart;
    }
    set loopStart(e) {
      this._source.loopStart = this.toSeconds(e);
    }
    get loopEnd() {
      return this._source.loopEnd;
    }
    set loopEnd(e) {
      this._source.loopEnd = this.toSeconds(e);
    }
    get buffer() {
      return this._buffer;
    }
    set buffer(e) {
      this._buffer.set(e);
    }
    get loop() {
      return this._source.loop;
    }
    set loop(e) {
      ((this._source.loop = e), this._sourceStarted && this.cancelStop());
    }
    dispose() {
      return (
        super.dispose(),
        (this._source.onended = null),
        this._source.disconnect(),
        this._buffer.dispose(),
        this.playbackRate.dispose(),
        this
      );
    }
  };
function Yc(e, t) {
  return q(this, void 0, void 0, function* () {
    let n = t / e.context.sampleRate,
      r = new Zs(1, n, e.context.sampleRate);
    return (
      new e.constructor(
        Object.assign(e.get(), { frequency: 2 / n, detune: 0, context: r }),
      )
        .toDestination()
        .start(0),
      (yield r.render()).getChannelData(0)
    );
  });
}
var Xc = class e extends Tc {
    constructor() {
      let t = J(e.getDefaults(), arguments, [`frequency`, `type`]);
      (super(t),
        (this.name = `ToneOscillatorNode`),
        (this._oscillator = this.context.createOscillator()),
        (this._internalChannels = [this._oscillator]),
        Sc(this._oscillator, this._gainNode),
        (this.type = t.type),
        (this.frequency = new Z({
          context: this.context,
          param: this._oscillator.frequency,
          units: `frequency`,
          value: t.frequency,
        })),
        (this.detune = new Z({
          context: this.context,
          param: this._oscillator.detune,
          units: `cents`,
          value: t.detune,
        })),
        Y(this, [`frequency`, `detune`]));
    }
    static getDefaults() {
      return Object.assign(Tc.getDefaults(), { detune: 0, frequency: 440, type: `sine` });
    }
    start(e) {
      let t = this.toSeconds(e);
      return (this.log(`start`, t), this._startGain(t), this._oscillator.start(t), this);
    }
    _stopSource(e) {
      this._oscillator.stop(e);
    }
    setPeriodicWave(e) {
      return (this._oscillator.setPeriodicWave(e), this);
    }
    get type() {
      return this._oscillator.type;
    }
    set type(e) {
      this._oscillator.type = e;
    }
    dispose() {
      return (
        super.dispose(),
        this.state === `started` && this.stop(),
        this._oscillator.disconnect(),
        this.frequency.dispose(),
        this.detune.dispose(),
        this
      );
    }
  },
  Zc = class e extends qc {
    constructor() {
      let t = J(e.getDefaults(), arguments, [`frequency`, `type`]);
      (super(t),
        (this.name = `Oscillator`),
        (this._oscillator = null),
        (this.frequency = new $({
          context: this.context,
          units: `frequency`,
          value: t.frequency,
        })),
        Y(this, `frequency`),
        (this.detune = new $({ context: this.context, units: `cents`, value: t.detune })),
        Y(this, `detune`),
        (this._partials = t.partials),
        (this._partialCount = t.partialCount),
        (this._type = t.type),
        t.partialCount &&
          t.type !== `custom` &&
          (this._type = this.baseType + t.partialCount.toString()),
        (this.phase = t.phase));
    }
    static getDefaults() {
      return Object.assign(qc.getDefaults(), {
        detune: 0,
        frequency: 440,
        partialCount: 0,
        partials: [],
        phase: 0,
        type: `sine`,
      });
    }
    _start(e) {
      let t = this.toSeconds(e),
        n = new Xc({ context: this.context, onended: () => this.onstop(this) });
      ((this._oscillator = n),
        this._wave
          ? this._oscillator.setPeriodicWave(this._wave)
          : (this._oscillator.type = this._type),
        this._oscillator.connect(this.output),
        this.frequency.connect(this._oscillator.frequency),
        this.detune.connect(this._oscillator.detune),
        this._oscillator.start(t));
    }
    _stop(e) {
      let t = this.toSeconds(e);
      this._oscillator && this._oscillator.stop(t);
    }
    _restart(e) {
      let t = this.toSeconds(e);
      return (
        this.log(`restart`, t),
        this._oscillator && this._oscillator.cancelStop(),
        this._state.cancel(t),
        this
      );
    }
    syncFrequency() {
      return (this.context.transport.syncSignal(this.frequency), this);
    }
    unsyncFrequency() {
      return (this.context.transport.unsyncSignal(this.frequency), this);
    }
    _getCachedPeriodicWave() {
      if (this._type === `custom`)
        return e._periodicWaveCache.find(
          (e) => e.phase === this._phase && Ds(e.partials, this._partials),
        );
      {
        let t = e._periodicWaveCache.find(
          (e) => e.type === this._type && e.phase === this._phase,
        );
        return ((this._partialCount = t ? t.partialCount : this._partialCount), t);
      }
    }
    get type() {
      return this._type;
    }
    set type(t) {
      this._type = t;
      let n = [`sine`, `square`, `sawtooth`, `triangle`].indexOf(t) !== -1;
      if (this._phase === 0 && n)
        ((this._wave = void 0),
          (this._partialCount = 0),
          this._oscillator !== null && (this._oscillator.type = t));
      else {
        let n = this._getCachedPeriodicWave();
        if (G(n)) {
          let { partials: e, wave: t } = n;
          ((this._wave = t),
            (this._partials = e),
            this._oscillator !== null && this._oscillator.setPeriodicWave(this._wave));
        } else {
          let [n, r] = this._getRealImaginary(t, this._phase),
            i = this.context.createPeriodicWave(n, r);
          ((this._wave = i),
            this._oscillator !== null && this._oscillator.setPeriodicWave(this._wave),
            e._periodicWaveCache.push({
              imag: r,
              partialCount: this._partialCount,
              partials: this._partials,
              phase: this._phase,
              real: n,
              type: this._type,
              wave: this._wave,
            }),
            e._periodicWaveCache.length > 100 && e._periodicWaveCache.shift());
        }
      }
    }
    get baseType() {
      return this._type.replace(this.partialCount.toString(), ``);
    }
    set baseType(e) {
      this.partialCount && this._type !== `custom` && e !== `custom`
        ? (this.type = e + this.partialCount)
        : (this.type = e);
    }
    get partialCount() {
      return this._partialCount;
    }
    set partialCount(e) {
      is(e, 0);
      let t = this._type,
        n = /^(sine|triangle|square|sawtooth)(\d+)$/.exec(this._type);
      if ((n && (t = n[1]), this._type !== `custom`))
        e === 0 ? (this.type = t) : (this.type = t + e.toString());
      else {
        let t = new Float32Array(e);
        (this._partials.forEach((e, n) => (t[n] = e)),
          (this._partials = Array.from(t)),
          (this.type = this._type));
      }
    }
    _getRealImaginary(e, t) {
      let n = 4096 / 2,
        r = new Float32Array(n),
        i = new Float32Array(n),
        a = 1;
      if (e === `custom`) {
        if (
          ((a = this._partials.length + 1),
          (this._partialCount = this._partials.length),
          (n = a),
          this._partials.length === 0)
        )
          return [r, i];
      } else {
        let t = /^(sine|triangle|square|sawtooth)(\d+)$/.exec(e);
        (t
          ? ((a = parseInt(t[2], 10) + 1),
            (this._partialCount = parseInt(t[2], 10)),
            (e = t[1]),
            (a = Math.max(a, 2)),
            (n = a))
          : (this._partialCount = 0),
          (this._partials = []));
      }
      for (let o = 1; o < n; ++o) {
        let n = 2 / (o * Math.PI),
          s;
        switch (e) {
          case `sine`:
            ((s = +(o <= a)), (this._partials[o - 1] = s));
            break;
          case `square`:
            ((s = o & 1 ? 2 * n : 0), (this._partials[o - 1] = s));
            break;
          case `sawtooth`:
            ((s = n * (o & 1 ? 1 : -1)), (this._partials[o - 1] = s));
            break;
          case `triangle`:
            ((s = o & 1 ? n * n * 2 * (((o - 1) >> 1) & 1 ? -1 : 1) : 0),
              (this._partials[o - 1] = s));
            break;
          case `custom`:
            s = this._partials[o - 1];
            break;
          default:
            throw TypeError(`Oscillator: invalid type: ` + e);
        }
        s === 0
          ? ((r[o] = 0), (i[o] = 0))
          : ((r[o] = -s * Math.sin(t * o)), (i[o] = s * Math.cos(t * o)));
      }
      return [r, i];
    }
    _inverseFFT(e, t, n) {
      let r = 0,
        i = e.length;
      for (let a = 0; a < i; a++) r += e[a] * Math.cos(a * n) + t[a] * Math.sin(a * n);
      return r;
    }
    getInitialValue() {
      let [e, t] = this._getRealImaginary(this._type, 0),
        n = 0,
        r = Math.PI * 2;
      for (let i = 0; i < 32; i++) n = Math.max(this._inverseFFT(e, t, (i / 32) * r), n);
      return Ls(-this._inverseFFT(e, t, this._phase) / n, -1, 1);
    }
    get partials() {
      return this._partials.slice(0, this.partialCount);
    }
    set partials(e) {
      ((this._partials = e),
        (this._partialCount = this._partials.length),
        e.length && (this.type = `custom`));
    }
    get phase() {
      return this._phase * (180 / Math.PI);
    }
    set phase(e) {
      ((this._phase = (e * Math.PI) / 180), (this.type = this._type));
    }
    asArray() {
      return q(this, arguments, void 0, function* (e = 1024) {
        return Yc(this, e);
      });
    }
    dispose() {
      return (
        super.dispose(),
        this._oscillator !== null && this._oscillator.dispose(),
        (this._wave = void 0),
        this.frequency.dispose(),
        this.detune.dispose(),
        this
      );
    }
  };
Zc._periodicWaveCache = [];
var Qc = class extends Vc {
    constructor() {
      (super(...arguments),
        (this.name = `AudioToGain`),
        (this._norm = new Hc({ context: this.context, mapping: (e) => (e + 1) / 2 })),
        (this.input = this._norm),
        (this.output = this._norm));
    }
    dispose() {
      return (super.dispose(), this._norm.dispose(), this);
    }
  },
  $c = class e extends $ {
    constructor() {
      let t = J(e.getDefaults(), arguments, [`value`]);
      (super(t),
        (this.name = `Multiply`),
        (this.override = !1),
        (this._mult =
          this.input =
          this.output =
            new wc({
              context: this.context,
              minValue: t.minValue,
              maxValue: t.maxValue,
            })),
        (this.factor = this._param = this._mult.gain),
        this.factor.setValueAtTime(t.value, 0));
    }
    static getDefaults() {
      return Object.assign($.getDefaults(), { value: 0 });
    }
    dispose() {
      return (super.dispose(), this._mult.dispose(), this);
    }
  },
  el = class e extends qc {
    constructor() {
      let t = J(e.getDefaults(), arguments, [`frequency`, `type`, `modulationType`]);
      (super(t),
        (this.name = `AMOscillator`),
        (this._modulationScale = new Qc({ context: this.context })),
        (this._modulationNode = new wc({ context: this.context })),
        (this._carrier = new Zc({
          context: this.context,
          detune: t.detune,
          frequency: t.frequency,
          onstop: () => this.onstop(this),
          phase: t.phase,
          type: t.type,
        })),
        (this.frequency = this._carrier.frequency),
        (this.detune = this._carrier.detune),
        (this._modulator = new Zc({
          context: this.context,
          phase: t.phase,
          type: t.modulationType,
        })),
        (this.harmonicity = new $c({
          context: this.context,
          units: `positive`,
          value: t.harmonicity,
        })),
        this.frequency.chain(this.harmonicity, this._modulator.frequency),
        this._modulator.chain(this._modulationScale, this._modulationNode.gain),
        this._carrier.chain(this._modulationNode, this.output),
        Y(this, [`frequency`, `detune`, `harmonicity`]));
    }
    static getDefaults() {
      return Object.assign(Zc.getDefaults(), {
        harmonicity: 1,
        modulationType: `square`,
      });
    }
    _start(e) {
      (this._modulator.start(e), this._carrier.start(e));
    }
    _stop(e) {
      (this._modulator.stop(e), this._carrier.stop(e));
    }
    _restart(e) {
      (this._modulator.restart(e), this._carrier.restart(e));
    }
    get type() {
      return this._carrier.type;
    }
    set type(e) {
      this._carrier.type = e;
    }
    get baseType() {
      return this._carrier.baseType;
    }
    set baseType(e) {
      this._carrier.baseType = e;
    }
    get partialCount() {
      return this._carrier.partialCount;
    }
    set partialCount(e) {
      this._carrier.partialCount = e;
    }
    get modulationType() {
      return this._modulator.type;
    }
    set modulationType(e) {
      this._modulator.type = e;
    }
    get phase() {
      return this._carrier.phase;
    }
    set phase(e) {
      ((this._carrier.phase = e), (this._modulator.phase = e));
    }
    get partials() {
      return this._carrier.partials;
    }
    set partials(e) {
      this._carrier.partials = e;
    }
    asArray() {
      return q(this, arguments, void 0, function* (e = 1024) {
        return Yc(this, e);
      });
    }
    dispose() {
      return (
        super.dispose(),
        this.frequency.dispose(),
        this.detune.dispose(),
        this.harmonicity.dispose(),
        this._carrier.dispose(),
        this._modulator.dispose(),
        this._modulationNode.dispose(),
        this._modulationScale.dispose(),
        this
      );
    }
  },
  tl = class e extends qc {
    constructor() {
      let t = J(e.getDefaults(), arguments, [`frequency`, `type`, `modulationType`]);
      (super(t),
        (this.name = `FMOscillator`),
        (this._modulationNode = new wc({ context: this.context, gain: 0 })),
        (this._carrier = new Zc({
          context: this.context,
          detune: t.detune,
          frequency: 0,
          onstop: () => this.onstop(this),
          phase: t.phase,
          type: t.type,
        })),
        (this.detune = this._carrier.detune),
        (this.frequency = new $({
          context: this.context,
          units: `frequency`,
          value: t.frequency,
        })),
        (this._modulator = new Zc({
          context: this.context,
          phase: t.phase,
          type: t.modulationType,
        })),
        (this.harmonicity = new $c({
          context: this.context,
          units: `positive`,
          value: t.harmonicity,
        })),
        (this.modulationIndex = new $c({
          context: this.context,
          units: `positive`,
          value: t.modulationIndex,
        })),
        this.frequency.connect(this._carrier.frequency),
        this.frequency.chain(this.harmonicity, this._modulator.frequency),
        this.frequency.chain(this.modulationIndex, this._modulationNode),
        this._modulator.connect(this._modulationNode.gain),
        this._modulationNode.connect(this._carrier.frequency),
        this._carrier.connect(this.output),
        this.detune.connect(this._modulator.detune),
        Y(this, [`modulationIndex`, `frequency`, `detune`, `harmonicity`]));
    }
    static getDefaults() {
      return Object.assign(Zc.getDefaults(), {
        harmonicity: 1,
        modulationIndex: 2,
        modulationType: `square`,
      });
    }
    _start(e) {
      (this._modulator.start(e), this._carrier.start(e));
    }
    _stop(e) {
      (this._modulator.stop(e), this._carrier.stop(e));
    }
    _restart(e) {
      return (this._modulator.restart(e), this._carrier.restart(e), this);
    }
    get type() {
      return this._carrier.type;
    }
    set type(e) {
      this._carrier.type = e;
    }
    get baseType() {
      return this._carrier.baseType;
    }
    set baseType(e) {
      this._carrier.baseType = e;
    }
    get partialCount() {
      return this._carrier.partialCount;
    }
    set partialCount(e) {
      this._carrier.partialCount = e;
    }
    get modulationType() {
      return this._modulator.type;
    }
    set modulationType(e) {
      this._modulator.type = e;
    }
    get phase() {
      return this._carrier.phase;
    }
    set phase(e) {
      ((this._carrier.phase = e), (this._modulator.phase = e));
    }
    get partials() {
      return this._carrier.partials;
    }
    set partials(e) {
      this._carrier.partials = e;
    }
    asArray() {
      return q(this, arguments, void 0, function* (e = 1024) {
        return Yc(this, e);
      });
    }
    dispose() {
      return (
        super.dispose(),
        this.frequency.dispose(),
        this.harmonicity.dispose(),
        this._carrier.dispose(),
        this._modulator.dispose(),
        this._modulationNode.dispose(),
        this.modulationIndex.dispose(),
        this
      );
    }
  },
  nl = class e extends qc {
    constructor() {
      let t = J(e.getDefaults(), arguments, [`frequency`, `width`]);
      (super(t),
        (this.name = `PulseOscillator`),
        (this._widthGate = new wc({ context: this.context, gain: 0 })),
        (this._thresh = new Hc({
          context: this.context,
          mapping: (e) => (e <= 0 ? -1 : 1),
        })),
        (this.width = new $({
          context: this.context,
          units: `audioRange`,
          value: t.width,
        })),
        (this._triangle = new Zc({
          context: this.context,
          detune: t.detune,
          frequency: t.frequency,
          onstop: () => this.onstop(this),
          phase: t.phase,
          type: `triangle`,
        })),
        (this.frequency = this._triangle.frequency),
        (this.detune = this._triangle.detune),
        this._triangle.chain(this._thresh, this.output),
        this.width.chain(this._widthGate, this._thresh),
        Y(this, [`width`, `frequency`, `detune`]));
    }
    static getDefaults() {
      return Object.assign(qc.getDefaults(), {
        detune: 0,
        frequency: 440,
        phase: 0,
        type: `pulse`,
        width: 0.2,
      });
    }
    _start(e) {
      ((e = this.toSeconds(e)),
        this._triangle.start(e),
        this._widthGate.gain.setValueAtTime(1, e));
    }
    _stop(e) {
      ((e = this.toSeconds(e)),
        this._triangle.stop(e),
        this._widthGate.gain.cancelScheduledValues(e),
        this._widthGate.gain.setValueAtTime(0, e));
    }
    _restart(e) {
      (this._triangle.restart(e),
        this._widthGate.gain.cancelScheduledValues(e),
        this._widthGate.gain.setValueAtTime(1, e));
    }
    get phase() {
      return this._triangle.phase;
    }
    set phase(e) {
      this._triangle.phase = e;
    }
    get type() {
      return `pulse`;
    }
    get baseType() {
      return `pulse`;
    }
    get partials() {
      return [];
    }
    get partialCount() {
      return 0;
    }
    set carrierType(e) {
      this._triangle.type = e;
    }
    asArray() {
      return q(this, arguments, void 0, function* (e = 1024) {
        return Yc(this, e);
      });
    }
    dispose() {
      return (
        super.dispose(),
        this._triangle.dispose(),
        this.width.dispose(),
        this._widthGate.dispose(),
        this._thresh.dispose(),
        this
      );
    }
  },
  rl = class e extends qc {
    constructor() {
      let t = J(e.getDefaults(), arguments, [`frequency`, `type`, `spread`]);
      (super(t),
        (this.name = `FatOscillator`),
        (this._oscillators = []),
        (this.frequency = new $({
          context: this.context,
          units: `frequency`,
          value: t.frequency,
        })),
        (this.detune = new $({ context: this.context, units: `cents`, value: t.detune })),
        (this._spread = t.spread),
        (this._type = t.type),
        (this._phase = t.phase),
        (this._partials = t.partials),
        (this._partialCount = t.partialCount),
        (this.count = t.count),
        Y(this, [`frequency`, `detune`]));
    }
    static getDefaults() {
      return Object.assign(Zc.getDefaults(), { count: 3, spread: 20, type: `sawtooth` });
    }
    _start(e) {
      ((e = this.toSeconds(e)), this._forEach((t) => t.start(e)));
    }
    _stop(e) {
      ((e = this.toSeconds(e)), this._forEach((t) => t.stop(e)));
    }
    _restart(e) {
      this._forEach((t) => t.restart(e));
    }
    _forEach(e) {
      for (let t = 0; t < this._oscillators.length; t++) e(this._oscillators[t], t);
    }
    get type() {
      return this._type;
    }
    set type(e) {
      ((this._type = e), this._forEach((t) => (t.type = e)));
    }
    get spread() {
      return this._spread;
    }
    set spread(e) {
      if (((this._spread = e), this._oscillators.length > 1)) {
        let t = -e / 2,
          n = e / (this._oscillators.length - 1);
        this._forEach((e, r) => (e.detune.value = t + n * r));
      }
    }
    get count() {
      return this._oscillators.length;
    }
    set count(e) {
      if ((is(e, 1), this._oscillators.length !== e)) {
        (this._forEach((e) => e.dispose()), (this._oscillators = []));
        for (let t = 0; t < e; t++) {
          let n = new Zc({
            context: this.context,
            volume: -6 - e * 1.1,
            type: this._type,
            phase: this._phase + (t / e) * 360,
            partialCount: this._partialCount,
            onstop: t === 0 ? () => this.onstop(this) : X,
          });
          (this.type === `custom` && (n.partials = this._partials),
            this.frequency.connect(n.frequency),
            this.detune.connect(n.detune),
            (n.detune.overridden = !1),
            n.connect(this.output),
            (this._oscillators[t] = n));
        }
        ((this.spread = this._spread),
          this.state === `started` && this._forEach((e) => e.start()));
      }
    }
    get phase() {
      return this._phase;
    }
    set phase(e) {
      ((this._phase = e),
        this._forEach((e, t) => (e.phase = this._phase + (t / this.count) * 360)));
    }
    get baseType() {
      return this._oscillators[0].baseType;
    }
    set baseType(e) {
      (this._forEach((t) => (t.baseType = e)), (this._type = this._oscillators[0].type));
    }
    get partials() {
      return this._oscillators[0].partials;
    }
    set partials(e) {
      ((this._partials = e),
        (this._partialCount = this._partials.length),
        e.length && ((this._type = `custom`), this._forEach((t) => (t.partials = e))));
    }
    get partialCount() {
      return this._oscillators[0].partialCount;
    }
    set partialCount(e) {
      ((this._partialCount = e),
        this._forEach((t) => (t.partialCount = e)),
        (this._type = this._oscillators[0].type));
    }
    asArray() {
      return q(this, arguments, void 0, function* (e = 1024) {
        return Yc(this, e);
      });
    }
    dispose() {
      return (
        super.dispose(),
        this.frequency.dispose(),
        this.detune.dispose(),
        this._forEach((e) => e.dispose()),
        this
      );
    }
  },
  il = class e extends qc {
    constructor() {
      let t = J(e.getDefaults(), arguments, [`frequency`, `modulationFrequency`]);
      (super(t),
        (this.name = `PWMOscillator`),
        (this.sourceType = `pwm`),
        (this._scale = new $c({ context: this.context, value: 2 })),
        (this._pulse = new nl({
          context: this.context,
          frequency: t.modulationFrequency,
        })),
        (this._pulse.carrierType = `sine`),
        (this.modulationFrequency = this._pulse.frequency),
        (this._modulator = new Zc({
          context: this.context,
          detune: t.detune,
          frequency: t.frequency,
          onstop: () => this.onstop(this),
          phase: t.phase,
        })),
        (this.frequency = this._modulator.frequency),
        (this.detune = this._modulator.detune),
        this._modulator.chain(this._scale, this._pulse.width),
        this._pulse.connect(this.output),
        Y(this, [`modulationFrequency`, `frequency`, `detune`]));
    }
    static getDefaults() {
      return Object.assign(qc.getDefaults(), {
        detune: 0,
        frequency: 440,
        modulationFrequency: 0.4,
        phase: 0,
        type: `pwm`,
      });
    }
    _start(e) {
      ((e = this.toSeconds(e)), this._modulator.start(e), this._pulse.start(e));
    }
    _stop(e) {
      ((e = this.toSeconds(e)), this._modulator.stop(e), this._pulse.stop(e));
    }
    _restart(e) {
      (this._modulator.restart(e), this._pulse.restart(e));
    }
    get type() {
      return `pwm`;
    }
    get baseType() {
      return `pwm`;
    }
    get partials() {
      return [];
    }
    get partialCount() {
      return 0;
    }
    get phase() {
      return this._modulator.phase;
    }
    set phase(e) {
      this._modulator.phase = e;
    }
    asArray() {
      return q(this, arguments, void 0, function* (e = 1024) {
        return Yc(this, e);
      });
    }
    dispose() {
      return (
        super.dispose(),
        this._pulse.dispose(),
        this._scale.dispose(),
        this._modulator.dispose(),
        this
      );
    }
  },
  al = { am: el, fat: rl, fm: tl, oscillator: Zc, pulse: nl, pwm: il },
  ol = class e extends qc {
    constructor() {
      let t = J(e.getDefaults(), arguments, [`frequency`, `type`]);
      (super(t),
        (this.name = `OmniOscillator`),
        (this.frequency = new $({
          context: this.context,
          units: `frequency`,
          value: t.frequency,
        })),
        (this.detune = new $({ context: this.context, units: `cents`, value: t.detune })),
        Y(this, [`frequency`, `detune`]),
        this.set(t));
    }
    static getDefaults() {
      return Object.assign(
        Zc.getDefaults(),
        tl.getDefaults(),
        el.getDefaults(),
        rl.getDefaults(),
        nl.getDefaults(),
        il.getDefaults(),
      );
    }
    _start(e) {
      this._oscillator.start(e);
    }
    _stop(e) {
      this._oscillator.stop(e);
    }
    _restart(e) {
      return (this._oscillator.restart(e), this);
    }
    get type() {
      let e = ``;
      return (
        [`am`, `fm`, `fat`].some((e) => this._sourceType === e) && (e = this._sourceType),
        e + this._oscillator.type
      );
    }
    set type(e) {
      e.substr(0, 2) === `fm`
        ? (this._createNewOscillator(`fm`),
          (this._oscillator = this._oscillator),
          (this._oscillator.type = e.substr(2)))
        : e.substr(0, 2) === `am`
          ? (this._createNewOscillator(`am`),
            (this._oscillator = this._oscillator),
            (this._oscillator.type = e.substr(2)))
          : e.substr(0, 3) === `fat`
            ? (this._createNewOscillator(`fat`),
              (this._oscillator = this._oscillator),
              (this._oscillator.type = e.substr(3)))
            : e === `pwm`
              ? (this._createNewOscillator(`pwm`), (this._oscillator = this._oscillator))
              : e === `pulse`
                ? this._createNewOscillator(`pulse`)
                : (this._createNewOscillator(`oscillator`),
                  (this._oscillator = this._oscillator),
                  (this._oscillator.type = e));
    }
    get partials() {
      return this._oscillator.partials;
    }
    set partials(e) {
      !this._getOscType(this._oscillator, `pulse`) &&
        !this._getOscType(this._oscillator, `pwm`) &&
        (this._oscillator.partials = e);
    }
    get partialCount() {
      return this._oscillator.partialCount;
    }
    set partialCount(e) {
      !this._getOscType(this._oscillator, `pulse`) &&
        !this._getOscType(this._oscillator, `pwm`) &&
        (this._oscillator.partialCount = e);
    }
    set(e) {
      return (
        Reflect.has(e, `type`) && e.type && (this.type = e.type),
        super.set(e),
        this
      );
    }
    _createNewOscillator(e) {
      if (e !== this._sourceType) {
        this._sourceType = e;
        let t = al[e],
          n = this.now();
        if (this._oscillator) {
          let e = this._oscillator;
          (e.stop(n), this.context.setTimeout(() => e.dispose(), this.blockTime));
        }
        ((this._oscillator = new t({ context: this.context })),
          this.frequency.connect(this._oscillator.frequency),
          this.detune.connect(this._oscillator.detune),
          this._oscillator.connect(this.output),
          (this._oscillator.onstop = () => this.onstop(this)),
          this.state === `started` && this._oscillator.start(n));
      }
    }
    get phase() {
      return this._oscillator.phase;
    }
    set phase(e) {
      this._oscillator.phase = e;
    }
    get sourceType() {
      return this._sourceType;
    }
    set sourceType(e) {
      let t = `sine`;
      (this._oscillator.type !== `pwm` &&
        this._oscillator.type !== `pulse` &&
        (t = this._oscillator.type),
        e === `fm`
          ? (this.type = `fm` + t)
          : e === `am`
            ? (this.type = `am` + t)
            : e === `fat`
              ? (this.type = `fat` + t)
              : e === `oscillator`
                ? (this.type = t)
                : e === `pulse`
                  ? (this.type = `pulse`)
                  : e === `pwm` && (this.type = `pwm`));
    }
    _getOscType(e, t) {
      return e instanceof al[t];
    }
    get baseType() {
      return this._oscillator.baseType;
    }
    set baseType(e) {
      !this._getOscType(this._oscillator, `pulse`) &&
        !this._getOscType(this._oscillator, `pwm`) &&
        e !== `pulse` &&
        e !== `pwm` &&
        (this._oscillator.baseType = e);
    }
    get width() {
      if (this._getOscType(this._oscillator, `pulse`)) return this._oscillator.width;
    }
    get count() {
      if (this._getOscType(this._oscillator, `fat`)) return this._oscillator.count;
    }
    set count(e) {
      this._getOscType(this._oscillator, `fat`) && Qo(e) && (this._oscillator.count = e);
    }
    get spread() {
      if (this._getOscType(this._oscillator, `fat`)) return this._oscillator.spread;
    }
    set spread(e) {
      this._getOscType(this._oscillator, `fat`) && Qo(e) && (this._oscillator.spread = e);
    }
    get modulationType() {
      if (
        this._getOscType(this._oscillator, `fm`) ||
        this._getOscType(this._oscillator, `am`)
      )
        return this._oscillator.modulationType;
    }
    set modulationType(e) {
      (this._getOscType(this._oscillator, `fm`) ||
        this._getOscType(this._oscillator, `am`)) &&
        ns(e) &&
        (this._oscillator.modulationType = e);
    }
    get modulationIndex() {
      if (this._getOscType(this._oscillator, `fm`))
        return this._oscillator.modulationIndex;
    }
    get harmonicity() {
      if (
        this._getOscType(this._oscillator, `fm`) ||
        this._getOscType(this._oscillator, `am`)
      )
        return this._oscillator.harmonicity;
    }
    get modulationFrequency() {
      if (this._getOscType(this._oscillator, `pwm`))
        return this._oscillator.modulationFrequency;
    }
    asArray() {
      return q(this, arguments, void 0, function* (e = 1024) {
        return Yc(this, e);
      });
    }
    dispose() {
      return (
        super.dispose(),
        this.detune.dispose(),
        this.frequency.dispose(),
        this._oscillator.dispose(),
        this
      );
    }
  };
function sl(e, t = 1 / 0) {
  let n = new WeakMap();
  return function (r, i) {
    Reflect.defineProperty(r, i, {
      configurable: !0,
      enumerable: !0,
      get: function () {
        return n.get(this);
      },
      set: function (r) {
        (is(r, e, t), n.set(this, r));
      },
    });
  };
}
function cl(e, t = 1 / 0) {
  let n = new WeakMap();
  return function (r, i) {
    Reflect.defineProperty(r, i, {
      configurable: !0,
      enumerable: !0,
      get: function () {
        return n.get(this);
      },
      set: function (r) {
        (is(this.toSeconds(r), e, t), n.set(this, r));
      },
    });
  };
}
var ll = class e extends qc {
  constructor() {
    let t = J(e.getDefaults(), arguments, [`url`, `onload`]);
    (super(t),
      (this.name = `Player`),
      (this._activeSources = new Set()),
      (this._buffer = new Xs({
        onload: this._onload.bind(this, t.onload),
        onerror: t.onerror,
        reverse: t.reverse,
        url: t.url,
      })),
      (this.autostart = t.autostart),
      (this._loop = t.loop),
      (this._loopStart = t.loopStart),
      (this._loopEnd = t.loopEnd),
      (this._playbackRate = t.playbackRate),
      (this.fadeIn = t.fadeIn),
      (this.fadeOut = t.fadeOut));
  }
  static getDefaults() {
    return Object.assign(qc.getDefaults(), {
      autostart: !1,
      fadeIn: 0,
      fadeOut: 0,
      loop: !1,
      loopEnd: 0,
      loopStart: 0,
      onload: X,
      onerror: X,
      playbackRate: 1,
      reverse: !1,
    });
  }
  load(e) {
    return q(this, void 0, void 0, function* () {
      return (yield this._buffer.load(e), this._onload(), this);
    });
  }
  _onload(e = X) {
    (e(), this.autostart && this.start());
  }
  _onSourceEnd(e) {
    (this.onstop(this),
      this._activeSources.delete(e),
      this._activeSources.size === 0 &&
        !this._synced &&
        this._state.getValueAtTime(this.now()) === `started` &&
        (this._state.cancel(this.now()),
        this._state.setStateAtTime(`stopped`, this.now())));
  }
  start(e, t, n) {
    return (super.start(e, t, n), this);
  }
  _start(e, t, n) {
    t = this._loop ? ks(t, this._loopStart) : ks(t, 0);
    let r = this.toSeconds(t),
      i = n;
    n = ks(n, Math.max(this._buffer.duration - r, 0));
    let a = this.toSeconds(n);
    ((a /= this._playbackRate), (e = this.toSeconds(e)));
    let o = new Jc({
      url: this._buffer,
      context: this.context,
      fadeIn: this.fadeIn,
      fadeOut: this.fadeOut,
      loop: this._loop,
      loopEnd: this._loopEnd,
      loopStart: this._loopStart,
      onended: this._onSourceEnd.bind(this),
      playbackRate: this._playbackRate,
    }).connect(this.output);
    (!this._loop &&
      !this._synced &&
      (this._state.cancel(e + a),
      this._state.setStateAtTime(`stopped`, e + a, { implicitEnd: !0 })),
      this._activeSources.add(o),
      this._loop && Xo(i)
        ? o.start(e, r)
        : o.start(e, r, a - this.toSeconds(this.fadeOut)));
  }
  _stop(e) {
    let t = this.toSeconds(e);
    this._activeSources.forEach((e) => e.stop(t));
  }
  restart(e, t, n) {
    return (super.restart(e, t, n), this);
  }
  _restart(e, t, n) {
    var r;
    ((r = [...this._activeSources].pop()) == null || r.stop(e), this._start(e, t, n));
  }
  seek(e, t) {
    let n = this.toSeconds(t);
    if (this._state.getValueAtTime(n) === `started`) {
      let t = this.toSeconds(e);
      (this._stop(n), this._start(n, t));
    }
    return this;
  }
  setLoopPoints(e, t) {
    return ((this.loopStart = e), (this.loopEnd = t), this);
  }
  get loopStart() {
    return this._loopStart;
  }
  set loopStart(e) {
    ((this._loopStart = e),
      this.buffer.loaded && is(this.toSeconds(e), 0, this.buffer.duration),
      this._activeSources.forEach((t) => {
        t.loopStart = e;
      }));
  }
  get loopEnd() {
    return this._loopEnd;
  }
  set loopEnd(e) {
    ((this._loopEnd = e),
      this.buffer.loaded && is(this.toSeconds(e), 0, this.buffer.duration),
      this._activeSources.forEach((t) => {
        t.loopEnd = e;
      }));
  }
  get buffer() {
    return this._buffer;
  }
  set buffer(e) {
    this._buffer.set(e);
  }
  get loop() {
    return this._loop;
  }
  set loop(e) {
    if (
      this._loop !== e &&
      ((this._loop = e),
      this._activeSources.forEach((t) => {
        t.loop = e;
      }),
      e)
    ) {
      let e = this._state.getNextState(`stopped`, this.now());
      e && this._state.cancel(e.time);
    }
  }
  get playbackRate() {
    return this._playbackRate;
  }
  set playbackRate(e) {
    this._playbackRate = e;
    let t = this.now(),
      n = this._state.getNextState(`stopped`, t);
    (n &&
      n.implicitEnd &&
      (this._state.cancel(n.time), this._activeSources.forEach((e) => e.cancelStop())),
      this._activeSources.forEach((n) => {
        n.playbackRate.setValueAtTime(e, t);
      }));
  }
  get reverse() {
    return this._buffer.reverse;
  }
  set reverse(e) {
    this._buffer.reverse = e;
  }
  get loaded() {
    return this._buffer.loaded;
  }
  dispose() {
    return (
      super.dispose(),
      this._activeSources.forEach((e) => e.dispose()),
      this._activeSources.clear(),
      this._buffer.dispose(),
      this
    );
  }
};
(vs([cl(0)], ll.prototype, `fadeIn`, void 0),
  vs([cl(0)], ll.prototype, `fadeOut`, void 0));
var ul = class e extends Q {
  constructor() {
    let t = J(e.getDefaults(), arguments, [`attack`, `decay`, `sustain`, `release`]);
    (super(t),
      (this.name = `Envelope`),
      (this._sig = new $({ context: this.context, value: 0 })),
      (this.output = this._sig),
      (this.input = void 0),
      (this.attack = t.attack),
      (this.decay = t.decay),
      (this.sustain = t.sustain),
      (this.release = t.release),
      (this.attackCurve = t.attackCurve),
      (this.releaseCurve = t.releaseCurve),
      (this.decayCurve = t.decayCurve));
  }
  static getDefaults() {
    return Object.assign(Q.getDefaults(), {
      attack: 0.01,
      attackCurve: `linear`,
      decay: 0.1,
      decayCurve: `exponential`,
      release: 1,
      releaseCurve: `exponential`,
      sustain: 0.5,
    });
  }
  get value() {
    return this.getValueAtTime(this.now());
  }
  _getCurve(e, t) {
    if (ns(e)) return e;
    {
      let n;
      for (n in dl) if (dl[n][t] === e) return n;
      return e;
    }
  }
  _setCurve(e, t, n) {
    if (ns(n) && Reflect.has(dl, n)) {
      let r = dl[n];
      $o(r) ? e !== `_decayCurve` && (this[e] = r[t]) : (this[e] = r);
    } else if (ts(n) && e !== `_decayCurve`) this[e] = n;
    else throw Error(`Envelope: invalid curve: ` + n);
  }
  get attackCurve() {
    return this._getCurve(this._attackCurve, `In`);
  }
  set attackCurve(e) {
    this._setCurve(`_attackCurve`, `In`, e);
  }
  get releaseCurve() {
    return this._getCurve(this._releaseCurve, `Out`);
  }
  set releaseCurve(e) {
    this._setCurve(`_releaseCurve`, `Out`, e);
  }
  get decayCurve() {
    return this._getCurve(this._decayCurve, `Out`);
  }
  set decayCurve(e) {
    this._setCurve(`_decayCurve`, `Out`, e);
  }
  triggerAttack(e, t = 1) {
    (this.log(`triggerAttack`, e, t), (e = this.toSeconds(e)));
    let n = this.toSeconds(this.attack),
      r = this.toSeconds(this.decay),
      i = this.getValueAtTime(e);
    if (i > 0) {
      let e = 1 / n;
      n = (1 - i) / e;
    }
    if (n < this.sampleTime)
      (this._sig.cancelScheduledValues(e), this._sig.setValueAtTime(t, e));
    else if (this._attackCurve === `linear`) this._sig.linearRampTo(t, n, e);
    else if (this._attackCurve === `exponential`) this._sig.targetRampTo(t, n, e);
    else {
      this._sig.cancelAndHoldAtTime(e);
      let r = this._attackCurve;
      for (let e = 1; e < r.length; e++)
        if (r[e - 1] <= i && i <= r[e]) {
          ((r = this._attackCurve.slice(e)), (r[0] = i));
          break;
        }
      this._sig.setValueCurveAtTime(r, e, n, t);
    }
    if (r && this.sustain < 1) {
      let i = t * this.sustain,
        a = e + n;
      (this.log(`decay`, a),
        this._decayCurve === `linear`
          ? this._sig.linearRampToValueAtTime(i, r + a)
          : this._sig.exponentialApproachValueAtTime(i, a, r));
    }
    return this;
  }
  triggerRelease(e) {
    (this.log(`triggerRelease`, e), (e = this.toSeconds(e)));
    let t = this.getValueAtTime(e);
    if (t > 0) {
      let n = this.toSeconds(this.release);
      n < this.sampleTime
        ? this._sig.setValueAtTime(0, e)
        : this._releaseCurve === `linear`
          ? this._sig.linearRampTo(0, n, e)
          : this._releaseCurve === `exponential`
            ? this._sig.targetRampTo(0, n, e)
            : (K(
                ts(this._releaseCurve),
                `releaseCurve must be either 'linear', 'exponential' or an array`,
              ),
              this._sig.cancelAndHoldAtTime(e),
              this._sig.setValueCurveAtTime(this._releaseCurve, e, n, t));
    }
    return this;
  }
  getValueAtTime(e) {
    return this._sig.getValueAtTime(e);
  }
  triggerAttackRelease(e, t, n = 1) {
    return (
      (t = this.toSeconds(t)),
      this.triggerAttack(t, n),
      this.triggerRelease(t + this.toSeconds(e)),
      this
    );
  }
  cancel(e) {
    return (this._sig.cancelScheduledValues(this.toSeconds(e)), this);
  }
  connect(e, t = 0, n = 0) {
    return (Dc(this, e, t, n), this);
  }
  asArray() {
    return q(this, arguments, void 0, function* (e = 1024) {
      let t = e / this.context.sampleRate,
        n = new Zs(1, t, this.context.sampleRate),
        r = this.toSeconds(this.attack) + this.toSeconds(this.decay),
        i = r + this.toSeconds(this.release),
        a = i * 0.1,
        o = i + a,
        s = new this.constructor(
          Object.assign(this.get(), {
            attack: (t * this.toSeconds(this.attack)) / o,
            decay: (t * this.toSeconds(this.decay)) / o,
            release: (t * this.toSeconds(this.release)) / o,
            context: n,
          }),
        );
      return (
        s._sig.toDestination(),
        s.triggerAttackRelease((t * (r + a)) / o, 0),
        (yield n.render()).getChannelData(0)
      );
    });
  }
  dispose() {
    return (super.dispose(), this._sig.dispose(), this);
  }
};
(vs([cl(0)], ul.prototype, `attack`, void 0),
  vs([cl(0)], ul.prototype, `decay`, void 0),
  vs([sl(0, 1)], ul.prototype, `sustain`, void 0),
  vs([cl(0)], ul.prototype, `release`, void 0));
var dl = (() => {
    let e,
      t,
      n = [];
    for (e = 0; e < 128; e++) n[e] = Math.sin((e / 127) * (Math.PI / 2));
    let r = [];
    for (e = 0; e < 127; e++)
      ((t = e / 127),
        (r[e] = (Math.sin(Math.PI * 2 * t * 6.4 - Math.PI / 2) + 1) / 10 + t * 0.83));
    r[127] = 1;
    let i = [];
    for (e = 0; e < 128; e++) i[e] = Math.ceil((e / 127) * 5) / 5;
    let a = [];
    for (e = 0; e < 128; e++) ((t = e / 127), (a[e] = 0.5 * (1 - Math.cos(Math.PI * t))));
    let o = [];
    for (e = 0; e < 128; e++) {
      t = e / 127;
      let n = t ** 3 * 4 + 0.2,
        r = Math.cos(n * Math.PI * 2 * t);
      o[e] = Math.abs(r * (1 - t));
    }
    function s(e) {
      let t = Array(e.length);
      for (let n = 0; n < e.length; n++) t[n] = 1 - e[n];
      return t;
    }
    function c(e) {
      return e.slice(0).reverse();
    }
    return {
      bounce: { In: s(o), Out: o },
      cosine: { In: n, Out: c(n) },
      exponential: `exponential`,
      linear: `linear`,
      ripple: { In: r, Out: s(r) },
      sine: { In: a, Out: s(a) },
      step: { In: i, Out: s(i) },
    };
  })(),
  fl = class e extends Q {
    constructor() {
      let t = J(e.getDefaults(), arguments);
      (super(t),
        (this._scheduledEvents = []),
        (this._synced = !1),
        (this._original_triggerAttack = this.triggerAttack),
        (this._original_triggerRelease = this.triggerRelease),
        (this._syncedRelease = (e) => this._original_triggerRelease(e)),
        (this._volume = this.output =
          new Mc({ context: this.context, volume: t.volume })),
        (this.volume = this._volume.volume),
        Y(this, `volume`));
    }
    static getDefaults() {
      return Object.assign(Q.getDefaults(), { volume: 0 });
    }
    sync() {
      return (
        this._syncState() &&
          (this._syncMethod(`triggerAttack`, 1),
          this._syncMethod(`triggerRelease`, 0),
          this.context.transport.on(`stop`, this._syncedRelease),
          this.context.transport.on(`pause`, this._syncedRelease),
          this.context.transport.on(`loopEnd`, this._syncedRelease)),
        this
      );
    }
    _syncState() {
      let e = !1;
      return (this._synced || ((this._synced = !0), (e = !0)), e);
    }
    _syncMethod(e, t) {
      let n = (this[`_original_` + e] = this[e]);
      this[e] = (...e) => {
        let r = e[t],
          i = this.context.transport.schedule((r) => {
            ((e[t] = r), n.apply(this, e));
          }, r);
        this._scheduledEvents.push(i);
      };
    }
    unsync() {
      return (
        this._scheduledEvents.forEach((e) => this.context.transport.clear(e)),
        (this._scheduledEvents = []),
        this._synced &&
          ((this._synced = !1),
          (this.triggerAttack = this._original_triggerAttack),
          (this.triggerRelease = this._original_triggerRelease),
          this.context.transport.off(`stop`, this._syncedRelease),
          this.context.transport.off(`pause`, this._syncedRelease),
          this.context.transport.off(`loopEnd`, this._syncedRelease)),
        this
      );
    }
    triggerAttackRelease(e, t, n, r) {
      let i = this.toSeconds(n),
        a = this.toSeconds(t);
      return (this.triggerAttack(e, i, r), this.triggerRelease(i + a), this);
    }
    dispose() {
      return (
        super.dispose(),
        this._volume.dispose(),
        this.unsync(),
        (this._scheduledEvents = []),
        this
      );
    }
  },
  pl = class e extends fl {
    constructor() {
      let t = J(e.getDefaults(), arguments);
      (super(t), (this.portamento = t.portamento), (this.onsilence = t.onsilence));
    }
    static getDefaults() {
      return Object.assign(fl.getDefaults(), { detune: 0, onsilence: X, portamento: 0 });
    }
    triggerAttack(e, t, n = 1) {
      this.log(`triggerAttack`, e, t, n);
      let r = this.toSeconds(t);
      return (this._triggerEnvelopeAttack(r, n), this.setNote(e, r), this);
    }
    triggerRelease(e) {
      this.log(`triggerRelease`, e);
      let t = this.toSeconds(e);
      return (this._triggerEnvelopeRelease(t), this);
    }
    setNote(e, t) {
      let n = this.toSeconds(t),
        r = e instanceof mc ? e.toFrequency() : e;
      if (this.portamento > 0 && this.getLevelAtTime(n) > 0.05) {
        let e = this.toSeconds(this.portamento);
        this.frequency.exponentialRampTo(r, e, n);
      } else this.frequency.setValueAtTime(r, n);
      return this;
    }
  };
vs([cl(0)], pl.prototype, `portamento`, void 0);
var ml = class e extends ul {
    constructor() {
      (super(J(e.getDefaults(), arguments, [`attack`, `decay`, `sustain`, `release`])),
        (this.name = `AmplitudeEnvelope`),
        (this._gainNode = new wc({ context: this.context, gain: 0 })),
        (this.output = this._gainNode),
        (this.input = this._gainNode),
        this._sig.connect(this._gainNode.gain),
        (this.output = this._gainNode),
        (this.input = this._gainNode));
    }
    dispose() {
      return (super.dispose(), this._gainNode.dispose(), this);
    }
  },
  hl = class e extends pl {
    constructor() {
      let t = J(e.getDefaults(), arguments);
      (super(t),
        (this.name = `Synth`),
        (this.oscillator = new ol(
          Object.assign(
            {
              context: this.context,
              detune: t.detune,
              onstop: () => this.onsilence(this),
            },
            t.oscillator,
          ),
        )),
        (this.frequency = this.oscillator.frequency),
        (this.detune = this.oscillator.detune),
        (this.envelope = new ml(Object.assign({ context: this.context }, t.envelope))),
        this.oscillator.chain(this.envelope, this.output),
        Y(this, [`oscillator`, `frequency`, `detune`, `envelope`]));
    }
    static getDefaults() {
      return Object.assign(pl.getDefaults(), {
        envelope: Object.assign(As(ul.getDefaults(), Object.keys(Q.getDefaults())), {
          attack: 0.005,
          decay: 0.1,
          release: 1,
          sustain: 0.3,
        }),
        oscillator: Object.assign(
          As(ol.getDefaults(), [...Object.keys(qc.getDefaults()), `frequency`, `detune`]),
          { type: `triangle` },
        ),
      });
    }
    _triggerEnvelopeAttack(e, t) {
      if (
        (this.envelope.triggerAttack(e, t),
        this.oscillator.start(e),
        this.envelope.sustain === 0)
      ) {
        let t = this.toSeconds(this.envelope.attack),
          n = this.toSeconds(this.envelope.decay);
        this.oscillator.stop(e + t + n);
      }
    }
    _triggerEnvelopeRelease(e) {
      (this.envelope.triggerRelease(e),
        this.oscillator.stop(e + this.toSeconds(this.envelope.release)));
    }
    getLevelAtTime(e) {
      return ((e = this.toSeconds(e)), this.envelope.getValueAtTime(e));
    }
    dispose() {
      return (super.dispose(), this.oscillator.dispose(), this.envelope.dispose(), this);
    }
  },
  gl = class e extends hl {
    constructor() {
      let t = J(e.getDefaults(), arguments);
      (super(t),
        (this.name = `MembraneSynth`),
        (this.portamento = 0),
        (this.pitchDecay = t.pitchDecay),
        (this.octaves = t.octaves),
        Y(this, [`oscillator`, `envelope`]));
    }
    static getDefaults() {
      return Es(pl.getDefaults(), hl.getDefaults(), {
        envelope: {
          attack: 0.001,
          attackCurve: `exponential`,
          decay: 0.4,
          release: 1.4,
          sustain: 0.01,
        },
        octaves: 10,
        oscillator: { type: `sine` },
        pitchDecay: 0.05,
      });
    }
    setNote(e, t) {
      let n = this.toSeconds(t),
        r = this.toFrequency(e instanceof mc ? e.toFrequency() : e),
        i = r * this.octaves;
      return (
        this.oscillator.frequency.setValueAtTime(i, n),
        this.oscillator.frequency.exponentialRampToValueAtTime(
          r,
          n + this.toSeconds(this.pitchDecay),
        ),
        this
      );
    }
    dispose() {
      return (super.dispose(), this);
    }
  };
(vs([sl(0)], gl.prototype, `octaves`, void 0),
  vs([cl(0)], gl.prototype, `pitchDecay`, void 0));
var _l = new Set();
function vl(e) {
  _l.add(e);
}
function yl(e, t) {
  let n = `registerProcessor("${e}", ${t})`;
  _l.add(n);
}
(vl(`
	/**
	 * The base AudioWorkletProcessor for use in Tone.js. Works with the {@link ToneAudioWorklet}. 
	 */
	class ToneAudioWorkletProcessor extends AudioWorkletProcessor {

		constructor(options) {
			
			super(options);
			/**
			 * If the processor was disposed or not. Keep alive until it's disposed.
			 */
			this.disposed = false;
		   	/** 
			 * The number of samples in the processing block
			 */
			this.blockSize = 128;
			/**
			 * the sample rate
			 */
			this.sampleRate = sampleRate;

			this.port.onmessage = (event) => {
				// when it receives a dispose 
				if (event.data === "dispose") {
					this.disposed = true;
				}
			};
		}
	}
`),
  vl(`
	/**
	 * Abstract class for a single input/output processor. 
	 * has a 'generate' function which processes one sample at a time
	 */
	class SingleIOProcessor extends ToneAudioWorkletProcessor {

		constructor(options) {
			super(Object.assign(options, {
				numberOfInputs: 1,
				numberOfOutputs: 1
			}));
			/**
			 * Holds the name of the parameter and a single value of that
			 * parameter at the current sample
			 * @type { [name: string]: number }
			 */
			this.params = {}
		}

		/**
		 * Generate an output sample from the input sample and parameters
		 * @abstract
		 * @param input number
		 * @param channel number
		 * @param parameters { [name: string]: number }
		 * @returns number
		 */
		generate(){}

		/**
		 * Update the private params object with the 
		 * values of the parameters at the given index
		 * @param parameters { [name: string]: Float32Array },
		 * @param index number
		 */
		updateParams(parameters, index) {
			for (const paramName in parameters) {
				const param = parameters[paramName];
				if (param.length > 1) {
					this.params[paramName] = parameters[paramName][index];
				} else {
					this.params[paramName] = parameters[paramName][0];
				}
			}
		}

		/**
		 * Process a single frame of the audio
		 * @param inputs Float32Array[][]
		 * @param outputs Float32Array[][]
		 */
		process(inputs, outputs, parameters) {
			const input = inputs[0];
			const output = outputs[0];
			// get the parameter values
			const channelCount = Math.max(input && input.length || 0, output.length);
			for (let sample = 0; sample < this.blockSize; sample++) {
				this.updateParams(parameters, sample);
				for (let channel = 0; channel < channelCount; channel++) {
					const inputSample = input && input.length ? input[channel][sample] : 0;
					output[channel][sample] = this.generate(inputSample, channel, this.params);
				}
			}
			return !this.disposed;
		}
	};
`),
  vl(`
	/**
	 * A multichannel buffer for use within an AudioWorkletProcessor as a delay line
	 */
	class DelayLine {
		
		constructor(size, channels) {
			this.buffer = [];
			this.writeHead = []
			this.size = size;

			// create the empty channels
			for (let i = 0; i < channels; i++) {
				this.buffer[i] = new Float32Array(this.size);
				this.writeHead[i] = 0;
			}
		}

		/**
		 * Push a value onto the end
		 * @param channel number
		 * @param value number
		 */
		push(channel, value) {
			this.writeHead[channel] += 1;
			if (this.writeHead[channel] > this.size) {
				this.writeHead[channel] = 0;
			}
			this.buffer[channel][this.writeHead[channel]] = value;
		}

		/**
		 * Get the recorded value of the channel given the delay
		 * @param channel number
		 * @param delay number delay samples
		 */
		get(channel, delay) {
			let readHead = this.writeHead[channel] - Math.floor(delay);
			if (readHead < 0) {
				readHead += this.size;
			}
			return this.buffer[channel][readHead];
		}
	}
`),
  yl(
    `feedback-comb-filter`,
    `
	class FeedbackCombFilterWorklet extends SingleIOProcessor {

		constructor(options) {
			super(options);
			this.delayLine = new DelayLine(this.sampleRate, options.channelCount || 2);
		}

		static get parameterDescriptors() {
			return [{
				name: "delayTime",
				defaultValue: 0.1,
				minValue: 0,
				maxValue: 1,
				automationRate: "k-rate"
			}, {
				name: "feedback",
				defaultValue: 0.5,
				minValue: 0,
				maxValue: 0.9999,
				automationRate: "k-rate"
			}];
		}

		generate(input, channel, parameters) {
			const delayedSample = this.delayLine.get(channel, parameters.delayTime * this.sampleRate);
			this.delayLine.push(channel, input + delayedSample * parameters.feedback);
			return delayedSample;
		}
	}
`,
  ));
var bl = class e extends fl {
  constructor() {
    let t = J(e.getDefaults(), arguments, [`urls`, `onload`, `baseUrl`], `urls`);
    (super(t), (this.name = `Sampler`), (this._activeSources = new Map()));
    let n = {};
    (Object.keys(t.urls).forEach((e) => {
      let r = parseInt(e, 10);
      if (
        (K(
          rs(e) || (Qo(r) && isFinite(r)),
          `url key is neither a note or midi pitch: ${e}`,
        ),
        rs(e))
      ) {
        let r = new mc(this.context, e).toMidi();
        n[r] = t.urls[e];
      } else Qo(r) && isFinite(r) && (n[r] = t.urls[r]);
    }),
      (this._buffers = new Fc({
        urls: n,
        onload: t.onload,
        baseUrl: t.baseUrl,
        onerror: t.onerror,
      })),
      (this.attack = t.attack),
      (this.release = t.release),
      (this.curve = t.curve),
      this._buffers.loaded && Promise.resolve().then(t.onload));
  }
  static getDefaults() {
    return Object.assign(fl.getDefaults(), {
      attack: 0,
      baseUrl: ``,
      curve: `exponential`,
      onload: X,
      onerror: X,
      release: 0.1,
      urls: {},
    });
  }
  _findClosest(e) {
    let t = 0;
    for (; t < 96;) {
      if (this._buffers.has(e + t)) return -t;
      if (this._buffers.has(e - t)) return t;
      t++;
    }
    throw Error(`No available buffers for note: ${e}`);
  }
  triggerAttack(e, t, n = 1) {
    return (
      this.log(`triggerAttack`, e, t, n),
      Array.isArray(e) || (e = [e]),
      e.forEach((e) => {
        let r = uc(new mc(this.context, e).toFrequency()),
          i = Math.round(r),
          a = r - i,
          o = this._findClosest(i),
          s = i - o,
          c = this._buffers.get(s),
          l = ac(o + a),
          u = new Jc({
            url: c,
            context: this.context,
            curve: this.curve,
            fadeIn: this.attack,
            fadeOut: this.release,
            playbackRate: l,
          }).connect(this.output);
        (u.start(t, 0, c.duration / l, n),
          ts(this._activeSources.get(i)) || this._activeSources.set(i, []),
          this._activeSources.get(i).push(u),
          (u.onended = () => {
            if (this._activeSources && this._activeSources.has(i)) {
              let e = this._activeSources.get(i),
                t = e.indexOf(u);
              t !== -1 && e.splice(t, 1);
            }
          }));
      }),
      this
    );
  }
  triggerRelease(e, t) {
    return (
      this.log(`triggerRelease`, e, t),
      Array.isArray(e) || (e = [e]),
      e.forEach((e) => {
        let n = new mc(this.context, e).toMidi();
        if (this._activeSources.has(n) && this._activeSources.get(n).length) {
          let e = this._activeSources.get(n);
          ((t = this.toSeconds(t)),
            e.forEach((e) => {
              e.stop(t);
            }),
            this._activeSources.set(n, []));
        }
      }),
      this
    );
  }
  releaseAll(e) {
    let t = this.toSeconds(e);
    return (
      this._activeSources.forEach((e) => {
        for (; e.length;) e.shift().stop(t);
      }),
      this
    );
  }
  sync() {
    return (
      this._syncState() &&
        (this._syncMethod(`triggerAttack`, 1), this._syncMethod(`triggerRelease`, 1)),
      this
    );
  }
  triggerAttackRelease(e, t, n, r = 1) {
    let i = this.toSeconds(n);
    return (
      this.triggerAttack(e, i, r),
      ts(t)
        ? (K(ts(e), `notes must be an array when duration is array`),
          e.forEach((e, n) => {
            let r = t[Math.min(n, t.length - 1)];
            this.triggerRelease(e, i + this.toSeconds(r));
          }))
        : this.triggerRelease(e, i + this.toSeconds(t)),
      this
    );
  }
  add(e, t, n) {
    if ((K(rs(e) || isFinite(e), `note must be a pitch or midi: ${e}`), rs(e))) {
      let r = new mc(this.context, e).toMidi();
      this._buffers.add(r, t, n);
    } else this._buffers.add(e, t, n);
    return this;
  }
  get loaded() {
    return this._buffers.loaded;
  }
  dispose() {
    return (
      super.dispose(),
      this._buffers.dispose(),
      this._activeSources.forEach((e) => {
        e.forEach((e) => e.dispose());
      }),
      this._activeSources.clear(),
      this
    );
  }
};
(vs([cl(0)], bl.prototype, `attack`, void 0),
  vs([cl(0)], bl.prototype, `release`, void 0));
var xl = class e extends Q {
  constructor() {
    let t = J(e.getDefaults(), arguments, [`pan`]);
    (super(t),
      (this.name = `Panner`),
      (this._panner = this.context.createStereoPanner()),
      (this.input = this._panner),
      (this.output = this._panner),
      (this.pan = new Z({
        context: this.context,
        param: this._panner.pan,
        value: t.pan,
        minValue: -1,
        maxValue: 1,
      })),
      (this._panner.channelCount = t.channelCount),
      (this._panner.channelCountMode = `explicit`),
      Y(this, `pan`));
  }
  static getDefaults() {
    return Object.assign(Q.getDefaults(), { pan: 0, channelCount: 1 });
  }
  dispose() {
    return (super.dispose(), this._panner.disconnect(), this.pan.dispose(), this);
  }
};
yl(
  `bit-crusher`,
  `
	class BitCrusherWorklet extends SingleIOProcessor {

		static get parameterDescriptors() {
			return [{
				name: "bits",
				defaultValue: 12,
				minValue: 1,
				maxValue: 16,
				automationRate: 'k-rate'
			}];
		}

		generate(input, _channel, parameters) {
			const step = Math.pow(0.5, parameters.bits - 1);
			const val = step * Math.floor(input / step + 0.5);
			return val;
		}
	}
`,
);
var Sl = class e extends Q {
  constructor() {
    let t = J(e.getDefaults(), arguments, [`solo`]);
    (super(t),
      (this.name = `Solo`),
      (this.input = this.output = new wc({ context: this.context })),
      e._allSolos.has(this.context) || e._allSolos.set(this.context, new Set()),
      e._allSolos.get(this.context).add(this),
      (this.solo = t.solo));
  }
  static getDefaults() {
    return Object.assign(Q.getDefaults(), { solo: !1 });
  }
  get solo() {
    return this._isSoloed();
  }
  set solo(t) {
    (t ? this._addSolo() : this._removeSolo(),
      e._allSolos.get(this.context).forEach((e) => e._updateSolo()));
  }
  get muted() {
    return this.input.gain.value === 0;
  }
  _addSolo() {
    (e._soloed.has(this.context) || e._soloed.set(this.context, new Set()),
      e._soloed.get(this.context).add(this));
  }
  _removeSolo() {
    e._soloed.has(this.context) && e._soloed.get(this.context).delete(this);
  }
  _isSoloed() {
    return e._soloed.has(this.context) && e._soloed.get(this.context).has(this);
  }
  _noSolos() {
    return (
      !e._soloed.has(this.context) ||
      (e._soloed.has(this.context) && e._soloed.get(this.context).size === 0)
    );
  }
  _updateSolo() {
    this._isSoloed() || this._noSolos()
      ? (this.input.gain.value = 1)
      : (this.input.gain.value = 0);
  }
  dispose() {
    return (
      super.dispose(),
      e._allSolos.get(this.context).delete(this),
      this._removeSolo(),
      this
    );
  }
};
((Sl._allSolos = new Map()), (Sl._soloed = new Map()));
var Cl = class e extends Q {
    constructor() {
      let t = J(e.getDefaults(), arguments, [`pan`, `volume`]);
      (super(t),
        (this.name = `PanVol`),
        (this._panner = this.input =
          new xl({ context: this.context, pan: t.pan, channelCount: t.channelCount })),
        (this.pan = this._panner.pan),
        (this._volume = this.output =
          new Mc({ context: this.context, volume: t.volume })),
        (this.volume = this._volume.volume),
        this._panner.connect(this._volume),
        (this.mute = t.mute),
        Y(this, [`pan`, `volume`]));
    }
    static getDefaults() {
      return Object.assign(Q.getDefaults(), {
        mute: !1,
        pan: 0,
        volume: 0,
        channelCount: 1,
      });
    }
    get mute() {
      return this._volume.mute;
    }
    set mute(e) {
      this._volume.mute = e;
    }
    dispose() {
      return (
        super.dispose(),
        this._panner.dispose(),
        this.pan.dispose(),
        this._volume.dispose(),
        this.volume.dispose(),
        this
      );
    }
  },
  wl = class e extends Q {
    constructor() {
      let t = J(e.getDefaults(), arguments, [`volume`, `pan`]);
      (super(t),
        (this.name = `Channel`),
        (this._solo = this.input = new Sl({ solo: t.solo, context: this.context })),
        (this._panVol = this.output =
          new Cl({
            context: this.context,
            pan: t.pan,
            volume: t.volume,
            mute: t.mute,
            channelCount: t.channelCount,
          })),
        (this.pan = this._panVol.pan),
        (this.volume = this._panVol.volume),
        this._solo.connect(this._panVol),
        Y(this, [`pan`, `volume`]));
    }
    static getDefaults() {
      return Object.assign(Q.getDefaults(), {
        pan: 0,
        volume: 0,
        mute: !1,
        solo: !1,
        channelCount: 1,
      });
    }
    get solo() {
      return this._solo.solo;
    }
    set solo(e) {
      this._solo.solo = e;
    }
    get muted() {
      return this._solo.muted || this.mute;
    }
    get mute() {
      return this._panVol.mute;
    }
    set mute(e) {
      this._panVol.mute = e;
    }
    _getBus(t) {
      return (
        e.buses.has(t) || e.buses.set(t, new wc({ context: this.context })),
        e.buses.get(t)
      );
    }
    send(e, t = 0) {
      let n = this._getBus(e),
        r = new wc({ context: this.context, units: `decibels`, gain: t });
      return (this.connect(r), r.connect(n), r);
    }
    receive(e) {
      return (this._getBus(e).connect(this), this);
    }
    dispose() {
      return (
        super.dispose(),
        this._panVol.dispose(),
        this.pan.dispose(),
        this.volume.dispose(),
        this._solo.dispose(),
        this
      );
    }
  };
((wl.buses = new Map()), ec().transport);
function Tl() {
  return ec().transport;
}
(ec().destination, ec().destination, ec().listener, ec().draw, ec());
var El = 40,
  Dl = 180,
  Ol = [`C`, `C#`, `D`, `D#`, `E`, `F`, `F#`, `G`, `G#`, `A`, `A#`, `B`];
function kl(e) {
  return Ol[((e % 12) + 12) % 12];
}
function Al(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function jl(e) {
  return e.reduce((e, t) => (t.notes.length > e.notes.length ? t : e));
}
function Ml(e) {
  return e.endings ? e.bodyBars + e.endings.reduce((e, t) => e + t.bars, 0) : e.bars;
}
function Nl(e, t) {
  return Array.from({ length: t }, (t, n) => e + n);
}
function Pl(e, t) {
  let { header: n } = t,
    r = n.ppq,
    [i, a] = e.timeSignatureOverride ?? n.timeSignatures[0].timeSignature,
    o = n.tempos[0].bpm,
    s = jl(t.tracks),
    c = (r * 4) / a,
    l = (r * 4 * i) / a,
    u = (e.pickupBeats ?? 0) * c,
    d = u,
    f = new Map(),
    p = (e) => (f.has(e) || f.set(e, { index: e, notes: [] }), f.get(e)),
    m = -1,
    h = null;
  for (let e of s.notes) {
    let t = e.ticks,
      n,
      r,
      i;
    if (t < u) ((n = 0), (r = t - u), (i = !0));
    else {
      let e = t - u,
        a = Math.floor(e / l),
        o = e - a * l;
      d > 0 && o >= l - d
        ? ((n = a + 1), (r = o - l), (i = !0))
        : ((n = a), (r = o), (i = !1));
    }
    (p(n).notes.push({
      midi: e.midi,
      offsetTicks: r,
      durTicks: e.durationTicks,
      isPickup: i,
    }),
      n > m && (m = n),
      !i && (h === null || t < h.tick) && (h = { tick: t, midi: e.midi }));
  }
  let g = m + 1,
    _ = `Tune "${e.id}"`;
  for (let t of e.parts)
    if (t.endings) {
      if (t.endings.length !== 2)
        throw Error(
          `${_}: Part "${t.name}" must have exactly two endings (1st/2nd), got ${t.endings.length}`,
        );
      if (!(t.bodyBars > 0))
        throw Error(
          `${_}: Part "${t.name}" bodyBars must be a positive number of bars, got ${t.bodyBars}`,
        );
      for (let [e, n] of t.endings.entries())
        if (!(n.bars > 0))
          throw Error(
            `${_}: Part "${t.name}" ending ${e + 1} bars must be a positive number of bars, got ${n.bars}`,
          );
    }
  for (let t of e.parts)
    if (t.startMeasure < 1 || t.startMeasure > g)
      throw Error(
        `${_}: Part "${t.name}" startMeasure ${t.startMeasure} is out of range (1..${g})`,
      );
  for (let t = 1; t < e.parts.length; t += 1) {
    let n = e.parts[t - 1],
      r = e.parts[t],
      i = n.startMeasure + Ml(n);
    if (r.startMeasure !== i)
      throw Error(
        `${_}: Part "${r.name}" startMeasure ${r.startMeasure} does not follow "${n.name}" (expected ${i})`,
      );
  }
  let v = e.parts.reduce((e, t) => e + Ml(t), 0);
  if (v !== g)
    throw Error(
      `${_}: Sum of part bars (${v}) does not match total full measures (${g})`,
    );
  for (let e = 0; e < g; e += 1) p(e);
  let y = Array.from(f.values()).sort((e, t) => e.index - t.index),
    b = e.practiceTempo ?? Al(Math.round(o * 0.7), El, Dl),
    x = h ? kl(h.midi) : null;
  return {
    id: e.id,
    title: e.title,
    type: e.type,
    tsNum: i,
    tsDen: a,
    ppq: r,
    ticksPerBeat: c,
    ticksPerMeasure: l,
    downbeatTick: u,
    midiTempo: o,
    practiceTempo: b,
    measures: y,
    parts: e.parts.map((e) => {
      let t = e.startMeasure - 1;
      if (!e.endings) return { ...e, startMeasure: t };
      let n = Nl(t, e.bodyBars),
        r = t + e.bodyBars,
        i = e.endings.map((e) => {
          let t = Nl(r, e.bars);
          return ((r += e.bars), { bars: e.bars, measures: t });
        }),
        [a, o] = i,
        s = y[a.measures[0]].notes.filter((e) => e.isPickup);
      return (
        s.length > 0 && y[o.measures[0]].notes.push(...s.map((e) => ({ ...e }))),
        {
          name: e.name,
          startMeasure: t,
          repeats: e.repeats,
          bodyBars: e.bodyBars,
          bodyMeasures: n,
          endings: i,
        }
      );
    }),
    hints: { key: e.hints?.key ?? null, startingNote: x },
    attribution: e.attribution ?? null,
  };
}
var Fl = 40,
  Il = 180;
function Ll(e) {
  return e.endings ? e.bodyBars + Math.max(...e.endings.map((e) => e.bars)) : e.bars;
}
function Rl(e) {
  return `flex: ${Ll(e)} 1 0`;
}
function zl(e, t) {
  for (let n of e.parts)
    if (n.endings) {
      for (let e = 0; e < n.endings.length; e += 1)
        if (n.endings[e].measures.includes(t)) return { part: n, endingIndex: e };
    }
  return null;
}
function Bl(e, t) {
  for (let n of e.parts)
    if (n.endings) {
      if (n.bodyMeasures.includes(t) || n.endings.some((e) => e.measures.includes(t)))
        return n;
    } else if (t >= n.startMeasure && t < n.startMeasure + n.bars) return n;
  return null;
}
var Vl = class extends HTMLElement {
  #e = null;
  #t = null;
  #n = null;
  #r = !1;
  #i = null;
  #a = !1;
  #o = null;
  #s = !1;
  #c = !1;
  #l = !0;
  #u = !1;
  #d = null;
  #f = null;
  #p = null;
  #m = !0;
  set tune(e) {
    (this.#h(),
      (this.#a = !1),
      (this.#d = null),
      (this.#e = e),
      (this.#o = e.practiceTempo),
      this.#O(null, null, !1),
      (this.#u = !1),
      this.#F());
  }
  get tune() {
    return this.#e;
  }
  connectedCallback() {
    (this.addEventListener(`click`, this.#E),
      this.addEventListener(`input`, this.#D),
      this.#F());
  }
  disconnectedCallback() {
    (this.removeEventListener(`click`, this.#E),
      this.removeEventListener(`input`, this.#D),
      this.#h());
  }
  play() {
    (this.#h(),
      (this.#a = !0),
      (this.#m = !1),
      this.dispatchEvent(
        new CustomEvent(`tune-play`, { bubbles: !0, detail: { id: this.#e.id } }),
      ),
      this.#F(),
      nc().then(() => {
        this.#m || this.#g();
      }));
  }
  stop() {
    (this.#h(),
      (this.#a = !1),
      (this.#d = null),
      this.dispatchEvent(
        new CustomEvent(`tune-stop`, { bubbles: !0, detail: { id: this.#e.id } }),
      ),
      this.#F());
  }
  #h() {
    this.#m = !0;
    let e = Tl();
    (e.stop(),
      e.cancel(0),
      (this.#f &&= (this.#f.dispose(), null)),
      (this.#p &&= (this.#p.dispose(), null)));
  }
  #g() {
    let e = this.#e,
      t = Tl();
    ((t.PPQ = e.ppq),
      (t.bpm.value = this.#o),
      (this.#f = new hl().toDestination()),
      (this.#p = new gl().toDestination()));
    let n = this.#t ?? 0,
      r = this.#n ?? e.measures.length - 1,
      i = this.#S(n, r),
      a = 0;
    this.#l && (a = this.#T(a, !0));
    let o = i[0] !== 0;
    (o || (a = Math.max(a, e.downbeatTick)), this.#C(a, i, o), t.start());
  }
  #_(e) {
    if (!e.endings) {
      let t = [];
      for (let n = e.startMeasure; n < e.startMeasure + e.bars; n += 1) t.push(n);
      let n = e.repeats ?? 1,
        r = [];
      for (let e = 0; e < n; e += 1) r.push(...t);
      return r;
    }
    return [
      ...e.bodyMeasures,
      ...e.endings[0].measures,
      ...e.bodyMeasures,
      ...e.endings[1].measures,
    ];
  }
  #v() {
    let e = [];
    for (let t of this.#e.parts) e.push(...this.#_(t));
    return e;
  }
  #y(e) {
    return this.#_(e);
  }
  #b(e) {
    return [...e.endings[0].measures, ...e.endings[1].measures];
  }
  #x(e, t, n) {
    let { part: r, endingIndex: i } = n,
      a = zl(this.#e, t);
    if (!a) {
      let n = [];
      for (let r = e; r <= t; r += 1) n.push(r);
      return n;
    }
    let o = a.part.endings[a.endingIndex].measures.indexOf(t),
      s = r.endings[i].measures.slice(0, o + 1),
      c = r.bodyMeasures[r.bodyMeasures.length - 1],
      l = [];
    for (let t = e; t <= c; t += 1) l.push(t);
    return (l.push(...s), l);
  }
  #S(e, t) {
    if (this.#r || this.#t === null) return this.#v();
    let n = this.#N();
    switch (n.kind) {
      case `full-part`:
        return this.#y(n.part);
      case `endings-only`:
        return this.#b(n.part);
      case `fragment-wrap`:
        return this.#x(e, t, n);
      default: {
        let n = [];
        for (let r = e; r <= t; r += 1) n.push(r);
        return n;
      }
    }
  }
  #C(e, t, n) {
    let r = this.#w(e, t, n),
      i = r;
    this.#s && (i = this.#T(r, !1));
    let a = this.#s;
    Tl().scheduleOnce(
      () => {
        this.#m || this.#C(i, t, a);
      },
      `${e + 1}i`,
    );
  }
  #w(e, t, n) {
    let r = this.#e,
      i = Tl();
    return (
      t.forEach((t, a) => {
        let o = r.measures[t],
          s = a === 0;
        i.scheduleOnce(() => {
          this.#m || ((this.#d = t), this.#F());
        }, `${e}i`);
        for (let t of o.notes)
          (t.isPickup && s && n) ||
            i.scheduleOnce(
              (e) => {
                if (this.#m) return;
                let n = _c(t.midi, `midi`).toFrequency(),
                  r = i.toSeconds(`${t.durTicks}i`);
                this.#f.triggerAttackRelease(n, r, e);
              },
              `${e + t.offsetTicks}i`,
            );
        this.#c ? (e = this.#T(e, !1)) : (e += r.ticksPerMeasure);
      }),
      e
    );
  }
  #T(e, t) {
    let n = this.#e,
      r = Tl();
    for (let i = 0; i < n.tsNum; i += 1) {
      let a = e + i * n.ticksPerBeat;
      r.scheduleOnce((e) => {
        if (this.#m || (!t && !this.#c)) return;
        let n = i === 0 ? `C3` : `C2`;
        this.#p.triggerAttackRelease(n, `32n`, e);
      }, `${a}i`);
    }
    return e + n.ticksPerMeasure;
  }
  getState() {
    return {
      playing: this.#a,
      selStart: this.#t,
      selEnd: this.#n,
      wholeTuneSelected: this.#r,
      bpm: this.#o,
      restBar: this.#s,
      metronome: this.#c,
      countIn: this.#l,
    };
  }
  #E = (e) => {
    let t = e.target.closest(`[data-measure-index]`),
      n = e.target.closest(`[data-part-index]`),
      r = e.target.closest(`.tl-select-all`),
      i = e.target.closest(`.tl-play-btn`),
      a = e.target.closest(`.tl-hint-toggle`);
    t
      ? this.#k(Number(t.dataset.measureIndex), t.dataset.endingRole)
      : n
        ? this.#A(Number(n.dataset.partIndex))
        : r
          ? this.#j()
          : i
            ? this.#a
              ? this.stop()
              : this.play()
            : a && ((this.#u = !this.#u), this.#F());
  };
  #D = (e) => {
    e.target.matches(`.tl-tempo-slider`)
      ? ((this.#o = Number(e.target.value)),
        this.#a && (Tl().bpm.value = this.#o),
        this.#F())
      : e.target.matches(`.tl-rest-bar-toggle`)
        ? (this.#s = e.target.checked)
        : e.target.matches(`.tl-metronome-toggle`)
          ? (this.#c = e.target.checked)
          : e.target.matches(`.tl-count-in-toggle`) && (this.#l = e.target.checked);
  };
  #O(e, t, n, r = null) {
    ((this.#t = e), (this.#n = t), (this.#r = n), (this.#i = r));
  }
  #k(e, t) {
    let n = t ? Number(t) : null;
    if (this.#t === null || this.#n !== null) this.#O(e, null, !1, n);
    else {
      let [t, r] = [this.#t, e];
      (r < t && ([t, r] = [r, t]), this.#O(t, r, !1, n));
    }
    this.#F();
  }
  #A(e) {
    let t = this.#e.parts[e];
    (this.#O(t.startMeasure, t.startMeasure + Ml(t) - 1, !1), this.#F());
  }
  #j() {
    (this.#O(0, this.#e.measures.length - 1, !0), this.#F());
  }
  #M() {
    if (this.#t === null || this.#n === null) return null;
    for (let e of this.#e.parts) {
      if (!e.endings) continue;
      let t = Ml(e);
      if (this.#t === e.startMeasure && this.#n === e.startMeasure + t - 1) return e;
    }
    return null;
  }
  #N() {
    if (this.#t === null || this.#n === null) return { kind: `plain` };
    let e = this.#M();
    if (e) return { kind: `full-part`, part: e };
    let t = zl(this.#e, this.#n);
    if (!t) return { kind: `plain` };
    let n = zl(this.#e, this.#t);
    if (n && n.part === t.part)
      return n.endingIndex === t.endingIndex
        ? { kind: `plain` }
        : { kind: `endings-only`, part: t.part };
    if (this.#i !== null)
      return {
        kind: `fragment-wrap`,
        part: t.part,
        endingIndex: this.#i - 1,
        override: !0,
      };
    let r = Bl(this.#e, this.#t) === t.part;
    return { kind: `fragment-wrap`, part: t.part, endingIndex: +!r, override: !1 };
  }
  #P(e) {
    return this.#t === null
      ? ``
      : this.#n === null
        ? e === this.#t
          ? `tl-cell--anchored`
          : ``
        : e >= this.#t && e <= this.#n
          ? `tl-cell--selected`
          : ``;
  }
  #F() {
    let e = this.#e;
    if (!e) {
      this.innerHTML = ``;
      return;
    }
    let t = e.parts.reduce((e, t) => e + Ml(t), 0),
      n = this.#r
        ? `${e.parts.reduce((e, t) => e + Ml(t) * (t.repeats ?? 1), 0)} bars with repeats`
        : `${t} bars`,
      r =
        e.downbeatTick > 0
          ? `<span class="tl-cell tl-cell--pickup" aria-hidden="true"></span>`
          : ``,
      i = e.parts
        .map(
          (e, t) => `
          <button type="button" class="tl-part" data-part-index="${t}" style="${Rl(e)}">
            ${e.name}
          </button>`,
        )
        .join(``),
      a = (e, t, n = {}) => {
        let r = e === this.#d ? `tl-cell--current` : ``,
          i = n.isFirst ? `tl-ending-cell--first` : ``,
          a = n.endingRole ? ` data-ending-role="${n.endingRole}"` : ``,
          o = n.isFirst
            ? `<span class="tl-ending-label">${n.endingRole === 1 ? `1st` : `2nd`}</span>`
            : ``;
        return `
        <button type="button" class="tl-cell ${this.#P(e)} ${r} ${i}"
                data-measure-index="${e}"${a}>
          ${o}${t}
        </button>`;
      },
      o = this.#N(),
      s = (e) => (o.kind !== `fragment-wrap` || o.part !== e ? null : o.endingIndex),
      c = 1,
      l = e.parts
        .map((e) => {
          if (!e.endings) {
            let t = [];
            for (let n = e.startMeasure; n < e.startMeasure + e.bars; n += 1)
              (t.push(a(n, c)), (c += 1));
            return t.join(``);
          }
          let t = s(e),
            n = (e) =>
              t === null ? `` : t === e ? `tl-ending-row--live` : `tl-ending-row--dim`,
            r = e.bodyMeasures
              .map((e) => {
                let t = a(e, c);
                return ((c += 1), t);
              })
              .join(``),
            i = c,
            o = Math.max(...e.endings.map((e) => e.bars)),
            l = e.endings
              .map((e, t) => {
                let r = e.measures
                  .map((e, n) => a(e, i + n, { endingRole: t + 1, isFirst: n === 0 }))
                  .join(``);
                return `
              <div class="tl-ending-row ${n(t)}" style="flex: ${e.bars} 1 0">
                ${r}
              </div>`;
              })
              .join(``);
          return (
            (c = i + o),
            `
          <div class="tl-part-frame" style="flex: ${Ll(e)} 1 0">
            <div class="tl-part-body" style="flex: ${e.bodyBars} 1 0">${r}</div>
            <div class="tl-part-endings" style="flex: ${o} 1 0">${l}</div>
          </div>`
          );
        })
        .join(``),
      u = this.#u
        ? `<div class="tl-hints">
           ${e.hints.key ? `<span class="tl-hint-key">Key: ${e.hints.key}</span>` : ``}
           ${e.hints.startingNote ? `<span class="tl-hint-start">Starts on ${e.hints.startingNote}</span>` : ``}
         </div>`
        : ``,
      d = e.attribution
        ? `<div class="tl-attribution">
           Contains information from <a href="${e.attribution.sourceUrl}" target="_blank" rel="noopener">${e.attribution.source}</a>,
           which is made available here under the Open Database License
           (<a href="${e.attribution.licenseUrl}" target="_blank" rel="noopener">${e.attribution.license}</a>).
           ${e.attribution.contributor ? `Added by ${e.attribution.contributor}${e.attribution.contributedDate ? ` on ${e.attribution.contributedDate}` : ``}.` : ``}
         </div>`
        : ``;
    this.innerHTML = `
      <div class="tl-header">
        <span class="tl-title">${e.title}</span>
        <span class="tl-type">${e.type}</span>
        <span class="tl-timesig">${e.tsNum}/${e.tsDen}</span>
        <span class="tl-barcount">${n}</span>
        <button type="button" class="tl-hint-toggle" aria-pressed="${this.#u}">?</button>
        ${u}
      </div>
      ${d}
      <div class="tl-select-all-row">
        <button type="button" class="tl-select-all">Whole Tune</button>
      </div>
      <div class="tl-parts">
        ${r}
        ${i}
      </div>
      <div class="tl-grid">
        ${r}
        ${l}
      </div>
      <div class="tl-transport">
        <button type="button" class="tl-play-btn">${this.#a ? `Stop` : `Play`}</button>
        <input type="range" class="tl-tempo-slider" min="${Fl}" max="${Il}" value="${this.#o}" />
        <span class="tl-tempo-readout">${this.#o} bpm</span>
      </div>
      <div class="tl-toggles">
        <label><input type="checkbox" class="tl-rest-bar-toggle" ${this.#s ? `checked` : ``} /> Rest bar</label>
        <label><input type="checkbox" class="tl-metronome-toggle" ${this.#c ? `checked` : ``} /> Metronome</label>
        <label><input type="checkbox" class="tl-count-in-toggle" ${this.#l ? `checked` : ``} /> Count-in</label>
      </div>
    `;
  }
};
customElements.define(`tune-looper`, Vl);
function Hl(e = document) {
  e.addEventListener(`tune-play`, (t) => {
    e.querySelectorAll(`tune-looper`).forEach((e) => {
      e !== t.target && e.stop();
    });
  });
}
async function Ul(e) {
  let [t, n] = await Promise.all([
    fetch(`tunes/${e}.json`).then((e) => e.json()),
    fetch(`tunes/${e}.mid`).then((e) => e.arrayBuffer()),
  ]);
  return Pl(t, new w.Midi(n));
}
async function Wl() {
  let e = await fetch(`tunes/manifest.json`).then((e) => e.json());
  document.querySelector(`#session-title`).textContent = e.session;
  let t = document.querySelector(`#tunes`);
  for (let n of e.tunes)
    try {
      let e = await Ul(n),
        r = document.createElement(`tune-looper`);
      ((r.tune = e), t.appendChild(r));
    } catch (e) {
      console.error(`Failed to load tune "${n}":`, e);
      let r = document.createElement(`div`);
      ((r.className = `tune-load-error`),
        (r.textContent = `Couldn't load "${n}": ${e.message}`),
        t.appendChild(r));
    }
  Hl(document);
}
Wl();
