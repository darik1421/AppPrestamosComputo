import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TextInput, Image, Alert, StyleSheet } from 'react-native';
import { collection, addDoc, doc, updateDoc, onSnapshot, deleteDoc } from "firebase/firestore"; 
import { db } from '../../connection/firebaseConfig';

const EquiposCRUD = () => {
  const [equipos, setEquipos] = useState([]);
  const [modelo, setModelo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [estado, setEstado] = useState('');
  const [imagen, setImagen] = useState('');
  const [categoria, setCategoria] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'Equipos'), (snapshot) => {
      const equiposData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEquipos(equiposData);
    });
    return unsubscribe;
  }, []);

  const handleEdit = (item) => {
    setModelo(item.modelo);
    setDescripcion(item.descripcion);
    setNumeroSerie(item.numeroSerie);
    setEstado(item.estado);
    setCategoria(item.categoria);
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'Equipos', id));
    } catch (error) {
      console.error("Error al eliminar equipo: ", error);
      Alert.alert("Error", "Hubo un problema al eliminar el equipo.");
    }
  };

  const handleSaveEquipo = async () => {
    if (!modelo.trim()) {
      Alert.alert("Validación", "El modelo del equipo es obligatorio.");
      return;
    }
    if (!descripcion.trim()) {
      Alert.alert("Validación", "La descripción del equipo es obligatoria.");
      return;
    }
    if (!numeroSerie.trim()) {
      Alert.alert("Validación", "El número de serie es obligatorio.");
      return;
    }
    if (!estado.trim()) {
      Alert.alert("Validación", "El estado del equipo es obligatorio.");
      return;
    }
    if (!categoria.trim()) {
      Alert.alert("Validación", "La categoría del equipo es obligatoria.");
      return;
    }

    try {
      if (editingId) {
        const equipoRef = doc(db, 'Equipos', editingId);
        await updateDoc(equipoRef, {
          modelo,
          descripcion,
          numeroSerie,
          estado,
          imagen,
          categoria,
        });
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'Equipos'), {
          modelo,
          descripcion,
          numeroSerie,
          estado,
          imagen,
          categoria,
          fechaRegistro: new Date(),
        });
      }
      // Limpiar campos
      setModelo('');
      setDescripcion('');
      setNumeroSerie('');
      setEstado('');
      setImagen('');
      setCategoria('');
    } catch (error) {
      console.error("Error al guardar equipo: ", error);
      Alert.alert("Error", "Hubo un problema al guardar el equipo.");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text>Modelo: {item.modelo}</Text>
      <Text>Descripción: {item.descripcion}</Text>
      <Text>Número de Serie: {item.numeroSerie}</Text>
      <Text>Estado: {item.estado}</Text>
      <Text>Categoría: {item.categoria}</Text>
      <Button title="Editar" onPress={() => handleEdit(item)} />
      <Button title="Eliminar" onPress={() => handleDelete(item.id)} />
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Modelo"
        value={modelo}
        onChangeText={setModelo}
      />
      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={descripcion}
        onChangeText={setDescripcion}
      />
      <TextInput
        style={styles.input}
        placeholder="Número de Serie"
        value={numeroSerie}
        onChangeText={setNumeroSerie}
      />
      <TextInput
        style={styles.input}
        placeholder="Estado"
        value={estado}
        onChangeText={setEstado}
      />
      <TextInput
        style={styles.input}
        placeholder="Categoría"
        value={categoria}
        onChangeText={setCategoria}
      />
      <Button
        title={editingId ? "Actualizar Equipo" : "Agregar Equipo"}
        onPress={handleSaveEquipo}
      />
    
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 40,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default EquiposCRUD;

