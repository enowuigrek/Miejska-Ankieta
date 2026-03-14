import React, { useState, useRef, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import './QRStickerModal.scss';

const DARK    = '#454545';
const BG      = '#ffffff';
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

// Numer #001 w prawym dolnym rogu
function drawNum(ctx, num, sizePx) {
    if (!num) return;
    const pad = Math.round(sizePx * 0.05);
    const fs  = Math.round(sizePx * 0.03);
    ctx.save();
    ctx.font         = `${fs}px ${F_HEAVY}`;
    ctx.fillStyle    = DARK;
    ctx.globalAlpha  = 0.28;
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`#${String(num).padStart(3, '0')}`, sizePx - pad, sizePx - pad);
    ctx.restore();
}

// ── Naklejka z pytaniem — pytanie (do lewej) + opcje jako tekst ───────────────
async function renderQuestionSticker(canvas, { questionText, options, questionNum, sizePx }) {
    await waitForFonts();
    canvas.width = canvas.height = sizePx;
    const ctx  = canvas.getContext('2d');
    const pad  = Math.round(sizePx * 0.08);

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, sizePx, sizePx);
    ctx.textBaseline = 'top';

    // — Rozmiary —
    const qLen  = questionText.length;
    const fsQ   = Math.round(sizePx * (qLen > 40 ? 0.066 : qLen > 20 ? 0.084 : 0.102));
    const scale      = options.length >= 5 ? 0.78 : options.length >= 4 ? 0.88 : 1;
    const fsOpt      = Math.round(sizePx * 0.072 * scale);
    const lineH_cont = Math.round(fsOpt * 1.1);   // odstęp między liniami tej samej opcji (ciasny)
    const lineH_opt  = Math.round(fsOpt * 1.85);  // odstęp między opcjami (wyraźnie większy)

    // — Mierzenie —
    const maxW = sizePx - pad * 2;
    ctx.font    = `${fsQ}px ${F_HEAVY}`;
    const lines = wrapText(ctx, questionText, maxW);
    const textH = lines.length * Math.round(fsQ * 1.15);

    // Zawijanie opcji — każda może być wieloliniowa
    ctx.font = `${fsOpt}px ${F_HEAVY}`;
    const optLines = options.map(opt => wrapText(ctx, opt.label, maxW));

    // Wysokość: linie wewnątrz opcji ciasno, przerwy między opcjami szeroko
    let optsH = 0;
    optLines.forEach(wrappedLines => { optsH += wrappedLines.length * lineH_cont; });
    optsH += (optLines.length - 1) * (lineH_opt - lineH_cont);

    const gapQ   = Math.round(sizePx * 0.06);
    const totalH = textH + gapQ + optsH;
    const nudge = Math.round(sizePx * 0.03);   // lekki offset w dół — kompensuje #numer i optyczny ciężar
    let y = Math.max(pad, Math.round((sizePx - totalH) / 2) + nudge);

    // — Rysowanie pytania —
    ctx.font      = `${fsQ}px ${F_HEAVY}`;
    ctx.fillStyle = DARK;
    ctx.textAlign = 'left';
    lines.forEach(line => { ctx.fillText(line, pad, y); y += Math.round(fsQ * 1.15); });

    y += gapQ;

    // — Opcje: linie tej samej opcji ciasno, między opcjami większy odstęp —
    ctx.font        = `${fsOpt}px ${F_HEAVY}`;
    ctx.fillStyle   = DARK;
    ctx.globalAlpha = 0.55;    // opcje cichsze — pytanie krzyczy, odpowiedzi szepczą
    ctx.textAlign   = 'left';
    optLines.forEach((wrappedLines, optIdx) => {
        wrappedLines.forEach(line => {
            ctx.fillText(line, pad, y);
            y += lineH_cont;
        });
        if (optIdx < optLines.length - 1) {
            y += lineH_opt - lineH_cont;  // dodatkowy odstęp między opcjami
        }
    });
    ctx.globalAlpha = 1;

    drawNum(ctx, questionNum, sizePx);
}

// ── Naklejka z samym QR — czysty kwadrat z kodem ─────────────────────────────
async function renderBareQRSticker(canvas, { questionId, questionNum, sizePx }) {
    canvas.width = canvas.height = sizePx;
    const ctx = canvas.getContext('2d');
    const pad = Math.round(sizePx * 0.05);

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, sizePx, sizePx);

    const qrSz    = sizePx - pad * 2;
    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, `https://jakmyslisz.com/${questionId}`, {
        width: qrSz, margin: 1,
        color: { dark: DARK, light: BG },
        errorCorrectionLevel: 'M',
    });
    canvas.getContext('2d').imageSmoothingEnabled = false;
    canvas.getContext('2d').drawImage(qrCanvas, pad, pad, qrSz, qrSz);

    drawNum(ctx, questionNum, sizePx);
}

// ── Naklejka ze znakiem zapytania — czerwony ? na całość ─────────────────────
async function renderQMarkSticker(canvas, { sizePx }) {
    await waitForFonts();
    canvas.width = canvas.height = sizePx;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, sizePx, sizePx);

    const fs = Math.round(sizePx * 0.92);
    ctx.font         = `${fs}px ${F_HEAVY}`;
    ctx.fillStyle    = '#FF2323';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'alphabetic';

    const m  = ctx.measureText('?');
    const tH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    const y  = (sizePx + tH) / 2 - m.actualBoundingBoxDescent;

    ctx.fillText('?', sizePx / 2, y);
    // bez numeru — naklejka uniwersalna
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function downloadCanvas(canvas, filename) {
    const a = document.createElement('a');
    a.download = filename;
    a.href = canvas.toDataURL('image/png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

const DPI = 300;

// ── Modal ─────────────────────────────────────────────────────────────────────
const TABS = [
    { id: 'pytanie', label: 'pytanie' },
    { id: 'goly',    label: 'QR'      },
    { id: 'qmark',   label: '?'       },
];

const QRStickerModal = ({ questionId, questionText, options = [], questionNum, onClose }) => {
    const [tab,       setTab]       = useState('pytanie');
    const [sizeMM,    setSizeMM]    = useState(80);
    const [rendering, setRendering] = useState(false);
    const previewRef = useRef(null);

    const renderPreview = useCallback(async () => {
        if (!previewRef.current) return;
        setRendering(true);
        try {
            const args = { questionText, questionId, options, questionNum, sizePx: PREVIEW_PX };
            if (tab === 'pytanie')    await renderQuestionSticker(previewRef.current, args);
            else if (tab === 'qmark') await renderQMarkSticker(previewRef.current, args);
            else                      await renderBareQRSticker(previewRef.current, args);
        } catch (e) { console.error('Sticker render error:', e); }
        finally     { setRendering(false); }
    }, [tab, questionText, questionId, options, questionNum]);

    useEffect(() => { renderPreview(); }, [renderPreview]);

    useEffect(() => {
        const h = e => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [onClose]);

    const handleDownload = useCallback(async () => {
        const sizePx = Math.round((sizeMM / 25.4) * DPI);
        const exp    = document.createElement('canvas');
        const args   = { questionText, questionId, options, questionNum, sizePx };
        try {
            if (tab === 'pytanie')    await renderQuestionSticker(exp, args);
            else if (tab === 'qmark') await renderQMarkSticker(exp, args);
            else                      await renderBareQRSticker(exp, args);
            const suffix = tab === 'qmark' ? 'znak-zapytania' : `${String(questionNum).padStart(3,'0')}-${tab}`;
            downloadCanvas(exp, `jakmyslisz-${suffix}-${sizeMM}mm-300dpi.png`);
        } catch (e) { console.error('Download error:', e); }
    }, [tab, questionText, questionId, options, questionNum, sizeMM]);

    const handleDownloadAll = useCallback(async () => {
        setRendering(true);
        try {
            const sizePx = Math.round((sizeMM / 25.4) * DPI);
            const args   = { questionText, questionId, options, questionNum, sizePx };
            const num    = String(questionNum).padStart(3, '0');
            const tasks  = [
                { fn: renderQuestionSticker, suffix: `${num}-pytanie`  },
                { fn: renderBareQRSticker,   suffix: `${num}-qr`       },
                { fn: renderQMarkSticker,    suffix: 'znak-zapytania'   },
            ];
            for (const task of tasks) {
                const c = document.createElement('canvas');
                await task.fn(c, args);
                downloadCanvas(c, `jakmyslisz-${task.suffix}-${sizeMM}mm-300dpi.png`);
                await new Promise(r => setTimeout(r, 250));
            }
        } catch (e) { console.error('Download all error:', e); }
        finally     { setRendering(false); }
    }, [questionText, questionId, options, questionNum, sizeMM]);

    return (
        <div className='qr-overlay' onClick={onClose}>
            <div className='qr-modal' onClick={e => e.stopPropagation()}>

                <div className='qr-modal-header'>
                    <div>
                        <div className='qr-modal-label'>
                            naklejki do druku — <span className='qr-modal-num'>#{String(questionNum).padStart(3,'0')}</span>
                        </div>
                        <div className='qr-modal-question'>{questionText}</div>
                    </div>
                    <button type='button' className='qr-close-btn' onClick={onClose}>✕</button>
                </div>

                <div className='qr-tabs'>
                    {TABS.map(t => (
                        <button key={t.id} type='button'
                            className={`qr-tab${tab === t.id ? ' active' : ''}`}
                            onClick={() => setTab(t.id)}
                        >{t.label}</button>
                    ))}
                </div>

                <div className='qr-preview-wrap'>
                    <canvas
                        ref={previewRef}
                        width={PREVIEW_PX} height={PREVIEW_PX}
                        className='qr-preview-canvas'
                        style={{ opacity: rendering ? 0.3 : 1 }}
                    />
                </div>

                <div className='qr-controls'>
                    <div className='qr-control'>
                        <label className='qr-control-label'>rozmiar</label>
                        <select className='qr-select' value={sizeMM} onChange={e => setSizeMM(+e.target.value)}>
                            <option value={80}>80 mm</option>
                            <option value={120}>120 mm</option>
                        </select>
                    </div>
                </div>

                <button type='button' className='qr-download-btn' onClick={handleDownloadAll} disabled={rendering}>
                    ↓ pobierz wszystkie 3 — {sizeMM}×{sizeMM} mm
                </button>
                <button type='button' className='qr-download-btn qr-download-btn--secondary' onClick={handleDownload} disabled={rendering}>
                    ↓ pobierz tylko ten
                </button>

            </div>
        </div>
    );
};

export default QRStickerModal;
