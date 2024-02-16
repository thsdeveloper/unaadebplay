import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';

const CountdownTimer = () => {
    // Define o tempo inicial de 10 minutos em segundos
    const initialTime = 10 * 60;
    const [timeLeft, setTimeLeft] = useState(initialTime);

    useEffect(() => {
        // Sair imediatamente quando o tempo chegar a 0
        if (timeLeft === 0) return;

        // Cria um intervalo que decrementa o 'timeLeft' a cada segundo
        const intervalId = setInterval(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        // Limpa o intervalo quando o componente é desmontado ou quando o tempo muda
        return () => clearInterval(intervalId);
    }, [timeLeft]);

    // Converte o tempo restante em minutos e segundos
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    // Formata os minutos e segundos para sempre mostrar dois dígitos
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return (
        <View>
            <Text>Tempo restante: {formattedMinutes}:{formattedSeconds}</Text>
        </View>
    );
};

export default CountdownTimer;
