import React, { useState } from 'react';
import { View, Text, TextInput, Image, Alert, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { collection, addDoc } from "firebase/firestore";
import { db } from '../../connection/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Laptop, HardDrive, Activity, Grid, Upload, PlusCircle, Image as ImageIcon } from 'lucide-react-native';

const EquiposCRUD = () => {
  const [modelo, setModelo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [estado, setEstado] = useState('');
  const [imagen, setImagen] = useState('');
  const [categoria, setCategoria] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const handleSaveEquipo = async () => {
    if (!modelo.trim() || !descripcion.trim() || !numeroSerie.trim() || !estado.trim() || !categoria.trim()) {
      Alert.alert("Validación", "Todos los campos son obligatorios.");
      return;
    }

    const categoriaNormalizada = categoria.trim().toLowerCase();

    try {
      await addDoc(collection(db, 'Equipos'), {
        modelo,
        descripcion,
        numeroSerie,
        estado,
        imagen,
        categoria: categoriaNormalizada,
        fechaRegistro: new Date(),
      });
      
      setModelo('');
      setDescripcion('');
      setNumeroSerie('');
      setEstado('');
      setImagen('');
      setCategoria('');
      Alert.alert("Éxito", "Equipo agregado correctamente");
    } catch (error) {
      console.error("Error al guardar equipo: ", error);
      Alert.alert("Error", "Hubo un problema al guardar el equipo.");
    }
  };

  const pickImage = async (useCamera = false) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se requieren permisos para acceder a la galería.');
      return;
    }

    let result;
    if (useCamera) {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus.status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se requieren permisos de cámara.');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    }

    if (!result.canceled) {
      setImagen(result.assets[0].uri);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Registro de Equipo</Text>
      
      <View style={styles.inputContainer}>
        <Laptop stroke="#4A5568" size={24} />
        <TextInput
          style={styles.input}
          placeholder="Modelo"
          value={modelo}
          onChangeText={setModelo}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <HardDrive stroke="#4A5568" size={24} />
        <TextInput
          style={styles.input}
          placeholder="Descripción"
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Grid stroke="#4A5568" size={24} />
        <TextInput
          style={styles.input}
          placeholder="Número de Serie"
          value={numeroSerie}
          onChangeText={setNumeroSerie}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Activity stroke="#4A5568" size={24} />
        <TextInput
          style={styles.input}
          placeholder="Estado"
          value={estado}
          onChangeText={setEstado}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Grid stroke="#4A5568" size={24} />
        <TextInput
          style={styles.input}
          placeholder="Categoría"
          value={categoria}
          onChangeText={setCategoria}
        />
      </View>
      
      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          {imagen ? (
            <Image source={{ uri: imagen }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Upload stroke="#4A5568" size={40} />
              <Text style={styles.imagePlaceholderText}>Imagen del equipo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.submitButton} onPress={handleSaveEquipo}>
        <PlusCircle stroke="#FFFFFF" size={24} />
        <Text style={styles.submitButtonText}>Agregar Equipo</Text>
      </TouchableOpacity>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar imagen</Text>
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: '#2196F3' }]} 
              onPress={() => {
                pickImage(false);
                setModalVisible(false);
              }}
            >
              <ImageIcon stroke="#FFFFFF" size={24} />
              <Text style={styles.modalButtonText}>Galería</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: '#2196F3' }]} 
              onPress={() => {
                pickImage(true);
                setModalVisible(false);
              }}
            >
              <Camera stroke="#FFFFFF" size={24} />
              <Text style={styles.modalButtonText}>Cámara</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7FAFC',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    elevation: 2,
  },
  input: {
    flex: 1,
    height: 50,
    marginLeft: 10,
    color: '#2D3748',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePlaceholderText: {
    color: '#4A5568',
    marginTop: 10,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#48BB78',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 33.4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E53E3E',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EquiposCRUD;

