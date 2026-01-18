import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { Toaster } from "@chakra-ui/react";
import { registerSW } from "virtual:pwa-register";
import { system } from "./theme/system";
import { AuthProvider } from "./contexts/AuthContext";
import { toaster } from "./lib/toast";
import App from "./App.tsx";
import "./index.css";

// Register service worker with auto-update
const updateSW = registerSW({
    onNeedRefresh() {
        if (confirm("Nueva versión disponible. ¿Actualizar ahora?")) {
            updateSW(true);
        }
    },
    onOfflineReady() {
        // App is ready to work offline
    },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ChakraProvider value={system}>
            <Toaster toaster={toaster}>
                {() => null}
            </Toaster>
            <AuthProvider>
                <App />
            </AuthProvider>
        </ChakraProvider>
    </React.StrictMode>
);
