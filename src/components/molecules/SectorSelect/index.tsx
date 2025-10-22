import React, { memo, useState, useEffect } from 'react';
import { View, TouchableOpacity, Modal, FlatList, ActivityIndicator } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { Input } from '@/components/atoms/Input';
import { Icon } from '@/components/atoms/Icon';
import { Text } from '@/components/atoms/Text';
import { Button } from '@/components/atoms/Button';
import { sectorsService, Sector } from '@/services/sectors';

interface SectorSelectProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const SectorSelect = memo<SectorSelectProps>(({ 
  value,
  onChange,
  label = 'Setor',
  error,
  disabled = false,
  className
}) => {
  const [show, setShow] = useState(false);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);

  useEffect(() => {
    loadSectors();
  }, []);

  useEffect(() => {
    if (value && sectors.length > 0) {
      const sector = sectors.find(s => s.id === value || s.title === value);
      setSelectedSector(sector || null);
    }
  }, [value, sectors]);

  const loadSectors = async () => {
    try {
      setLoading(true);
      const data = await sectorsService.getSectors();
      setSectors(data);
    } catch (error) {
      console.error('Erro ao carregar setores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (sector: Sector) => {
    setSelectedSector(sector);
    onChange(sector.title);
    setShow(false);
  };

  const renderSectorItem = ({ item }: { item: Sector }) => (
    <TouchableOpacity
      onPress={() => handleSelect(item)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
      }}
    >
      <Text variant="body" color="#000">
        {item.title}
      </Text>
      {selectedSector?.id === item.id && (
        <Icon name={Check} size={20} color="#3b82f6" />
      )}
    </TouchableOpacity>
  );

  return (
    <View className={className}>
      {label && (
        <Text variant="label" className="mb-2">
          {label}
        </Text>
      )}
      
      <TouchableOpacity
        onPress={() => !disabled && setShow(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View pointerEvents="none">
          <Input
            value={selectedSector?.title || ''}
            placeholder="Selecione o setor"
            editable={false}
            error={error}
            disabled={disabled}
          />
          <View className="absolute right-3 top-3">
            <Icon name={ChevronDown} size={20} color="#6b7280" />
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        transparent={true}
        animationType="slide"
        visible={show}
        onRequestClose={() => setShow(false)}
      >
        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
          activeOpacity={1}
          onPress={() => setShow(false)}
        >
          <View style={{ flex: 1 }} />
          <View style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '70%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#e5e7eb',
            }}>
              <Text variant="subheading" color="#000">
                Selecione o Setor
              </Text>
              <Button
                variant="ghost"
                size="small"
                onPress={() => setShow(false)}
              >
                Fechar
              </Button>
            </View>
            
            {loading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#3b82f6" />
              </View>
            ) : (
              <FlatList
                data={sectors}
                keyExtractor={(item) => item.id}
                renderItem={renderSectorItem}
                showsVerticalScrollIndicator={true}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
});

SectorSelect.displayName = 'SectorSelect';