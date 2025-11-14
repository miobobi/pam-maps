// app/index.tsx
import { GOOGLE_MAPS_API_KEY } from '@env';
import React, { useRef, useState } from 'react';
import {
    Alert,
    Keyboard,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  // Região inicial (São Paulo)
  const [region, setRegion] = useState({
    latitude: -23.55052,
    longitude: -46.633308,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [query, setQuery] = useState('');
  const mapRef = useRef<MapView | null>(null);

  async function handleSearch() {
    const texto = query.trim();
    if (!texto) return;

    Keyboard.dismiss();

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        texto,
      )}&key=${GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' || !data.results.length) {
        Alert.alert(
          'Local não encontrado',
          'Tente um endereço mais específico (ex.: "Campinas, SP").',
        );
        return;
      }

      const { lat, lng } = data.results[0].geometry.location;

      const newRegion = {
        ...region,
        latitude: lat,
        longitude: lng,
      };

      setRegion(newRegion);

      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 800);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Erro ao buscar',
        'Não foi possível buscar essa localização. Verifique a conexão ou a chave da API.',
      );
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Campo de busca */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Busque um local (ex.: São Paulo)"
            placeholderTextColor="#888"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
        </View>

        {/* Mapa */}
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: 10,
    left: 16,
    right: 16,
    zIndex: 1000,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  input: {
    fontSize: 16,
  },
  map: {
    flex: 1,
  },
});
