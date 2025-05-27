import { Stack } from 'expo-router';
import React from "react";

export default function EventLayout() {
    return (
        <Stack screenOptions={{
            headerShown: false,
            animation: 'fade_from_bottom',
        }}>
            <Stack.Screen 
                name="index" 
                options={{
                    headerShown: false,
                }} 
            />
            <Stack.Screen 
                name="event/[id]" 
                options={{
                    headerShown: true,
                    animation: 'slide_from_right',
                }} 
            />
        </Stack>
    );
}
