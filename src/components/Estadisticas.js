import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Estadisticas = () => {
    return (
        <View style={styles.container}>
            <Text>Pantalla de Estadísticas</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    }
});

export default Estadisticas;