// src/utils/retry.ts
export async function retryWithBackoff(
    operation: () => Promise<any>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<any> {
    let retries = 0;

    while (true) {
        try {
            return await operation();
        } catch (error) {
            retries++;

            if (retries > maxRetries) {
                throw error;
            }

            // Atraso exponencial com jitter
            const delay = baseDelay * Math.pow(2, retries - 1) * (0.9 + Math.random() * 0.2);
            console.log(`Tentativa ${retries} falhou, tentando novamente em ${Math.round(delay)}ms`);

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}
