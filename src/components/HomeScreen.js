import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { collection, onSnapshot } from "firebase/firestore";
import { db } from '../../connection/firebaseConfig';

const HomeScreen = () => {
    const [equipos, setEquipos] = useState([]);

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
        <View style={styles.cardContainer}>
            <Text style={styles.titulo}>{item.modelo}</Text>
            <Text style={styles.texto}>Descripción: {item.descripcion}</Text>
            <Text style={styles.texto}>Estado: {item.estado}</Text>
            <Text style={styles.texto}>Categoría: {item.categoria}</Text>
            <Text style={styles.texto}>N Serie: {item.numeroSerie}</Text>
        </View>
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
    }
});

export default HomeScreen;