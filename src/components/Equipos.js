import React from 'react';
import { View, StyleSheet } from 'react-native';
import EquiposCRUD from './EquiposCRUD';

const Equipos = () => {
    return (
        <View style={styles.container}>
            <EquiposCRUD/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        flex: 1,
        backgroundColor: '#fff',
    }
});

export default Equipos;