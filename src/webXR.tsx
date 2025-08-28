import { WebXRHelper, WebXR } from "@3dverse/livelink-webxr";
import { useState, useEffect } from "react";

export function XRButton({
    mode,
    setXRMode,
    text = "Enter",
}: {
    mode: XRSessionMode;
    text?: string;
    setXRMode: (mode: XRSessionMode) => void;
}) {
    const [isSessionSupported, setIsSessionSupported] = useState(false);
    const [message, setMessage] = useState("");
    const xrModeTitle = mode.endsWith("ar") ? "AR" : "VR";

    useEffect(() => {
        if (!window.isSecureContext) {
            setMessage("WebXR requires a secure context (https).");
            return;
        }

        WebXRHelper.isSessionSupported(mode).then(supported => {
            if (!supported) {
                setMessage(`WebXR '${mode}' is not supported on this device.`);
            } else {
                setIsSessionSupported(true);
            }
        });
    }, [mode]);

    return (
        <button
            className={
                "button button-primary" +
                (!isSessionSupported ? " opacity-50" : "")
            }
            onClick={() => setXRMode(mode)}
            disabled={!isSessionSupported}
            style={isSessionSupported ? {} : { cursor: "not-allowed" }}
            title={message}
        >
            {text} {xrModeTitle}
        </button>
    );
}