import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Modal, TouchableOpacity, Image } from 'react-native';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from '../../connection/firebaseConfig';
import { TextInput, Button, Alert } from 'react-native';

const HomeScreen = () => {
    const [equipos, setEquipos] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedEquipo, setSelectedEquipo] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedEquipo, setEditedEquipo] = useState(null);

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

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.cardContainer}
            onPress={() => {
                setSelectedEquipo(item);
                setModalVisible(true);
            }}
        >
            <Text style={styles.titulo}>{item.modelo}</Text>
            <Text style={styles.texto}>Descripción: {item.descripcion}</Text>
            <Text style={styles.texto}>Categoría: {item.categoria}</Text>
            <Text style={styles.texto}>Estado: {item.estado}</Text>
        </TouchableOpacity>
    );

    const handleEdit = () => {
        setIsEditing(true);
        setEditedEquipo({ ...selectedEquipo });
    };

    const handleSave = async () => {
        try {
            const equipoRef = doc(db, 'Equipos', editedEquipo.id);
            await updateDoc(equipoRef, {
                modelo: editedEquipo.modelo,
                descripcion: editedEquipo.descripcion,
                numeroSerie: editedEquipo.numeroSerie,
                estado: editedEquipo.estado,
                categoria: editedEquipo.categoria,
            });
            setIsEditing(false);
            setModalVisible(false);
            Alert.alert("Éxito", "Equipo actualizado correctamente");
        } catch (error) {
            Alert.alert("Error", "No se pudo actualizar el equipo");
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            "Confirmar eliminación",
            "¿Estás seguro de que deseas eliminar este equipo?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Eliminar",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'Equipos', selectedEquipo.id));
                            setModalVisible(false);
                            Alert.alert("Éxito", "Equipo eliminado correctamente");
                        } catch (error) {
                            Alert.alert("Error", "No se pudo eliminar el equipo");
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Catálogo de Equipos</Text>
            <FlatList
                data={equipos}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.listContainer}
            />
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                    setIsEditing(false);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        {selectedEquipo && !isEditing ? (
                            <>
                                {selectedEquipo.imagen && (
                                    <Image
                                        source={{ uri: selectedEquipo.imagen }}
                                        style={styles.modalImage}
                                    />
                                )}
                                <Text style={styles.modalTitle}>{selectedEquipo.modelo}</Text>
                                <Text style={styles.modalText}>Descripción: {selectedEquipo.descripcion}</Text>
                                <Text style={styles.modalText}>Estado: {selectedEquipo.estado}</Text>
                                <Text style={styles.modalText}>Categoría: {selectedEquipo.categoria}</Text>
                                <Text style={styles.modalText}>N° Serie: {selectedEquipo.numeroSerie}</Text>

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity
                                        style={[styles.button, styles.editButton]}
                                        onPress={handleEdit}
                                    >
                                        <Text style={styles.buttonText}>Editar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.button, styles.deleteButton]}
                                        onPress={handleDelete}
                                    >
                                        <Text style={styles.buttonText}>Eliminar</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : editedEquipo && (
                            <>
                                <TextInput
                                    style={styles.input}
                                    value={editedEquipo.modelo}
                                    onChangeText={(text) => setEditedEquipo({ ...editedEquipo, modelo: text })}
                                    placeholder="Modelo"
                                />
                                <TextInput
                                    style={styles.input}
                                    value={editedEquipo.descripcion}
                                    onChangeText={(text) => setEditedEquipo({ ...editedEquipo, descripcion: text })}
                                    placeholder="Descripción"
                                />
                                <TextInput
                                    style={styles.input}
                                    value={editedEquipo.numeroSerie}
                                    onChangeText={(text) => setEditedEquipo({ ...editedEquipo, numeroSerie: text })}
                                    placeholder="Número de Serie"
                                />
                                <TextInput
                                    style={styles.input}
                                    value={editedEquipo.estado}
                                    onChangeText={(text) => setEditedEquipo({ ...editedEquipo, estado: text })}
                                    placeholder="Estado"
                                />
                                <TextInput
                                    style={styles.input}
                                    value={editedEquipo.categoria}
                                    onChangeText={(text) => setEditedEquipo({ ...editedEquipo, categoria: text })}
                                    placeholder="Categoría"
                                />
                                <View style={styles.buttonContainer}>

                                    <TouchableOpacity
                                        style={[styles.button, styles.cancelButton]}
                                        onPress={() => setIsEditing(false)}>
                                        <Text style={styles.buttonText}>Cancelar</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.button, styles.saveButton]}
                                        onPress={handleSave}
                                    >
                                        <Text style={styles.buttonText}>Guardar</Text>
                                    </TouchableOpacity>

                                </View>
                            </>
                        )}

                        {!isEditing && (
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>Cerrar</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 50,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    listContainer: {
        padding: 10,
    },
    cardContainer: {
        flex: 1,
        margin: 5,
        padding: 15,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        maxWidth: '47%',
    },
    titulo: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    texto: {
        fontSize: 14,
        marginBottom: 4,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalImage: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    modalText: {
        fontSize: 14,
        marginBottom: 4,
    },
    closeButton: {
        backgroundColor: '#2196F3',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 10,
    },
    button: {
        padding: 10,
        borderRadius: 5,
        minWidth: 100,
        marginHorizontal: 5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    editButton: {
        backgroundColor: '#4CAF50',
    },
    deleteButton: {
        backgroundColor: '#f44336',
    },
    saveButton: {
        backgroundColor: '#2196F3',
    },
    cancelButton: {
        backgroundColor: '#757575',
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
});

export default HomeScreen;