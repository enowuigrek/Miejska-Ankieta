import React, { useState, useRef, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { QUESTIONS_DATA } from '../../data/questionsData';
import './QRStickerModal.scss';

const DARK = '#454545';   // rgb(69,69,69)
const BG   = '#f3f2f2';   // rgb(243,242,242)
const F_HEAVY = '"Archivo Black", "Arial Black", Impact, sans-serif';

const PREVIEW_PX = 560;

async function waitForFonts() {
    if (document.fonts) {
        await document.fonts.load(`800 20px "Archivo Black"`).catch(() => {});
    }
}

function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    if (ctx.measureText(text).width <= maxWidth) return [text];
    const lines = [];
    let cur = words[0];
    for (let i = 1; i < words.length; i++) {
        const test = cur + ' ' + words[i];
        if (ctx.measureText(test).width > maxWidth) { lines.push(cur); cur = words[i]; }
        else cur = test;
    }
    lines.push(cur);
    return lines;
}

// ── Naklejka QR — pytanie + kod QR ───────────────────────────────────────────
async function renderQRSticker(canvas, { questionText, questionId, sizePx }) {
    await waitForFonts();
    canvas.width  = sizePx;
    canvas.height = sizePx;
    const ctx = canvas.getContext('2d');
    const pad = Math.round(sizePx * 0.08);
    const cx  = sizePx / 2;

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, sizePx, sizePx);
    ctx.textBaseline = 'top';

    let y = pad;

    // Pytanie
    const qLen = questionText.length;
    const fsQ  = Math.round(sizePx * (qLen > 40 ? 0.065 : qLen > 20 ? 0.082 : 0.1));
    ctx.font      = `${fsQ}px ${F_HEAVY}`;
    ctx.fillStyle = DARK;
    ctx.textAlign = 'center';
    const lines = wrapText(ctx, questionText, sizePx - pad * 2);
    lines.forEach(line => { ctx.fillText(line, cx, y); y += Math.round(fsQ * 1.15); });

    // Kreska pod pytaniem
    y += Math.round(sizePx * 0.02);
    ctx.strokeStyle = DARK;
    ctx.lineWidth   = Math.max(2, Math.round(sizePx * 0.004));
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(sizePx - pad, y); ctx.stroke();
    y += Math.round(sizePx * 0.04);

    // QR code — wypełnia pozostałe miejsce
    const qrSize = Math.min(
        Math.round(sizePx * 0.72),
        sizePx - y - pad
    );
    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, `https://jakmyslisz.com/${questionId}`, {
        width: qrSize,
        margin: 1,
        color: { dark: DARK, light: BG },
        errorCorrectionLevel: 'M',
    });
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(qrCanvas, (sizePx - qrSize) / 2, y, qrSize, qrSize);
}

// ── Naklejka z pytaniem — pytanie + opcje jako tekst ─────────────────────────
async function renderQuestionSticker(canvas, { questionText, options, sizePx }) {
    await waitForFonts();
    canvas.width  = sizePx;
    canvas.height = sizePx;
    const ctx  = canvas.getContext('2d');
    const pad  = Math.round(sizePx * 0.08);
    const cx   = sizePx / 2;

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, sizePx, sizePx);
    ctx.textBaseline = 'top';

    let y = pad;

    // Pytanie
    const qLen = questionText.length;
    const fsQ  = Math.round(sizePx * (qLen > 40 ? 0.065 : qLen > 20 ? 0.082 : 0.1));
    ctx.font      = `${fsQ}px ${F_HEAVY}`;
    ctx.fillStyle = DARK;
    ctx.textAlign = 'center';
    const lines = wrapText(ctx, questionText, sizePx - pad * 2);
    lines.forEach(line => { ctx.fillText(line, cx, y); y += Math.round(fsQ * 1.15); });

    // Kreska pod pytaniem
    y += Math.round(sizePx * 0.02);
    ctx.strokeStyle = DARK;
    ctx.lineWidth   = Math.max(2, Math.round(sizePx * 0.004));
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(sizePx - pad, y); ctx.stroke();
    y += Math.round(sizePx * 0.045);

    // Opcje — plain text, jak w appce
    const scale  = options.length >= 5 ? 0.78 : options.length >= 4 ? 0.88 : 1;
    const fsOpt  = Math.round(sizePx * 0.072 * scale);
    const fsCzy  = Math.round(sizePx * 0.055 * scale);
    const lineH  = Math.round(fsOpt * 1.35);
    const czyH   = Math.round(fsCzy * 1.3);

    options.forEach((opt, i) => {
        if (i === options.length - 1 && options.length > 1) {
            ctx.font      = `${fsCzy}px ${F_HEAVY}`;
            ctx.fillStyle = DARK;
            ctx.textAlign = 'left';
            ctx.fillText('czy', pad, y);
            y += czyH;
        }
        ctx.font      = `${fsOpt}px ${F_HEAVY}`;
        ctx.fillStyle = DARK;
        ctx.textAlign = 'left';
        ctx.fillText(opt.label, pad, y);
        y += lineH;
    });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function slugify(str) {
    return str.toLowerCase()
        .replace(/ą/g,'a').replace(/ć/g,'c').replace(/ę/g,'e')
        .replace(/ł/g,'l').replace(/ń/g,'n').replace(/ó/g,'o')
        .replace(/ś/g,'s').replace(/ź/g,'z').replace(/ż/g,'z')
        .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

function downloadCanvas(canvas, filename) {
    const a = document.createElement('a');
    a.download = filename;
    a.href = canvas.toDataURL('image/png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// ── Modal ─────────────────────────────────────────────────────────────────────
const QRStickerModal = ({ questionId, questionText, onClose }) => {
    const [tab,       setTab]       = useState('qr');
    const [sizeMM,    setSizeMM]    = useState(80);
    const [dpi,       setDpi]       = useState(300);
    const [rendering, setRendering] = useState(false);
    const previewRef = useRef(null);

    const options = QUESTIONS_DATA[questionId]?.options ?? [];

    const renderPreview = useCallback(async () => {
        if (!previewRef.current) return;
        setRendering(true);
        try {
            if (tab === 'qr') {
                await renderQRSticker(previewRef.current, { questionText, questionId, sizePx: PREVIEW_PX });
            } else {
                await renderQuestionSticker(previewRef.current, { questionText, options, sizePx: PREVIEW_PX });
            }
        } catch (e) {
            console.error('Sticker render error:', e);
        } finally {
            setRendering(false);
        }
    }, [tab, questionText, questionId, options]);

    useEffect(() => { renderPreview(); }, [renderPreview]);

    useEffect(() => {
        const handler = e => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    const handleDownload = useCallback(async () => {
        const sizePx = Math.round((sizeMM / 25.4) * dpi);
        const exp    = document.createElement('canvas');
        const suffix = tab === 'qr' ? 'qr' : 'pytanie';
        try {
            if (tab === 'qr') {
                await renderQRSticker(exp, { questionText, questionId, sizePx });
            } else {
                await renderQuestionSticker(exp, { questionText, options, sizePx });
            }
            downloadCanvas(exp, `jakmyslisz-${slugify(questionText)}-${suffix}-${sizeMM}mm-${dpi}dpi.png`);
        } catch (e) {
            console.error('Download error:', e);
        }
    }, [tab, questionText, questionId, options, sizeMM, dpi]);

    const sizePx = Math.round((sizeMM / 25.4) * dpi);

    return (
        <div className='qr-overlay' onClick={onClose}>
            <div className='qr-modal' onClick={e => e.stopPropagation()}>

                <div className='qr-modal-header'>
                    <div>
                        <div className='qr-modal-label'>naklejki do druku</div>
                        <div className='qr-modal-question'>{questionText}</div>
                    </div>
                    <button type='button' className='qr-close-btn' onClick={onClose}>✕</button>
                </div>

                <div className='qr-tabs'>
                    <button type='button' className={`qr-tab${tab === 'qr' ? ' active' : ''}`} onClick={() => setTab('qr')}>
                        naklejka QR
                    </button>
                    <button type='button' className={`qr-tab${tab === 'pytanie' ? ' active' : ''}`} onClick={() => setTab('pytanie')}>
                        naklejka z pytaniem
                    </button>
                </div>

                <div className='qr-preview-wrap'>
                    <canvas
                        ref={previewRef}
                        width={PREVIEW_PX}
                        height={PREVIEW_PX}
                        className='qr-preview-canvas'
                        style={{ opacity: rendering ? 0.3 : 1 }}
                    />
                </div>

                <div className='qr-controls'>
                    <div className='qr-control'>
                        <label className='qr-control-label'>rozmiar</label>
                        <select className='qr-select' value={sizeMM} onChange={e => setSizeMM(+e.target.value)}>
                            <option value={60}>60 mm</option>
                            <option value={80}>80 mm</option>
                            <option value={100}>100 mm</option>
                            <option value={120}>120 mm</option>
                        </select>
                    </div>
                    <div className='qr-control'>
                        <label className='qr-control-label'>jakość</label>
                        <select className='qr-select' value={dpi} onChange={e => setDpi(+e.target.value)}>
                            <option value={150}>150 DPI</option>
                            <option value={300}>300 DPI</option>
                            <option value={600}>600 DPI</option>
                        </select>
                    </div>
                </div>

                <button type='button' className='qr-download-btn' onClick={handleDownload}>
                    ↓ pobierz PNG — {sizeMM}×{sizeMM} mm @ {dpi} DPI ({sizePx}px)
                </button>

            </div>
        </div>
    );
};

export default QRStickerModal;
