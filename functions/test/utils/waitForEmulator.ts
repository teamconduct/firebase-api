import { waitUntilUsed } from 'tcp-port-used';

async function waitForEmulators(): Promise<void> {
    await waitUntilUsed(5001, 500, 600000);
    await waitUntilUsed(8080, 500, 600000);
    await new Promise(resolve => {
        setTimeout(resolve, 5000);
    });
}

void waitForEmulators();
