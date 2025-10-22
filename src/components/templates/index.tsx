// Temporary exports until full implementation
import React from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StatusBar, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { ChevronLeft } from 'lucide-react-native';

interface AuthTemplateProps {
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  showHeader?: boolean;
  onBack?: () => void;
}

export const AuthTemplate: React.FC<AuthTemplateProps> = ({ 
  isLoading, 
  title, 
  subtitle, 
  children,
  showHeader = true,
  onBack
}) => {
  if (isLoading) {
    return (
      <>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#0f172a', '#1e293b', '#334155']}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <LottieView
            source={require('@/assets/99297-loading-files.json')}
            autoPlay
            loop
            style={{ width: 200, height: 200 }}
          />
          <Text style={{ color: 'white', marginTop: 20, fontSize: 16 }}>
            Carregando...
          </Text>
        </LinearGradient>
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#334155']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={{ 
              flex: 1, 
              padding: 24, 
              paddingTop: Platform.OS === 'ios' ? 60 : 40,
              justifyContent: 'center',
              minHeight: '100%'
            }}>
              {/* Botão de voltar */}
              {onBack && (
                <TouchableOpacity
                  onPress={onBack}
                  style={{
                    position: 'absolute',
                    top: Platform.OS === 'ios' ? 50 : 30,
                    left: 20,
                    zIndex: 10,
                    padding: 10,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 25,
                  }}
                >
                  <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
              )}

              {/* Logo e Título */}
              {title && showHeader && (
                <View style={{ alignItems: 'center', marginBottom: 40 }}>
                  {/* Logo */}
                  <View style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 24,
                    borderWidth: 2,
                    borderColor: 'rgba(96, 165, 250, 0.3)',
                  }}>
                    <Image
                      source={require("@/assets/unaadeb-login.png")}
                      style={{ width: 100, height: 100, borderRadius: 50 }}
                    />
                  </View>

                  {/* Título */}
                  <Text style={{ 
                    fontSize: 32, 
                    fontWeight: 'bold', 
                    color: 'white', 
                    textAlign: 'center', 
                    marginBottom: 8,
                    textShadowColor: 'rgba(0, 0, 0, 0.3)',
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 4,
                  }}>
                    {title}
                  </Text>

                  {/* Subtitle */}
                  {subtitle && (
                    <Text style={{ 
                      fontSize: 16, 
                      color: 'rgba(255,255,255,0.7)', 
                      textAlign: 'center' 
                    }}>
                      {subtitle}
                    </Text>
                  )}
                </View>
              )}

              {/* Conteúdo */}
              {children}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
};