import { QRCodeSVG } from 'qrcode.react';

const QRCodeDisplay = ({ event }) => {
    if (!event?.qr_token) return null;

    const qrData = JSON.stringify({
        token: event.qr_token,
        event_id: event.id,
        title: event.title
    });

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-2xl">
                <QRCodeSVG
                    value={qrData}
                    size={220}
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                    level="H"
                    includeMargin={true}
                />
            </div>
            <div className="text-center">
                <p className="text-sm font-semibold text-white mb-1">{event.title}</p>
                <p className="text-xs text-slate-400 mb-3">
                    Show this QR code at the event for students to scan
                </p>
                <div className="bg-slate-900 rounded-lg px-3 py-2">
                    <p className="text-xs text-slate-500 font-mono">Token: {event.qr_token?.substring(0, 16)}...</p>
                </div>
            </div>
            <button
                onClick={() => {
                    const svg = document.querySelector('#qr-svg');
                    if (svg) {
                        const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `qr-${event.title}.svg`;
                        a.click();
                    }
                }}
                className="btn-primary text-sm"
            >
                ⬇️ Download QR
            </button>
        </div>
    );
};

export default QRCodeDisplay;
