import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Modal, TouchableOpacity, Image } from 'react-native';
import { collection, onSnapshot } from "firebase/firestore";
import { db } from '../../connection/firebaseConfig';

const HomeScreen = () => {
    const [equipos, setEquipos] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedEquipo, setSelectedEquipo] = useState(null);

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
            <Text style={styles.texto}>Estado: {item.estado}</Text>
            <Text style={styles.texto}>Categoría: {item.categoria}</Text>
        </TouchableOpacity>
    );

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
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        {selectedEquipo && (
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
                            </>
                        )}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Cerrar</Text>
                        </TouchableOpacity>
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
});

export default HomeScreen;