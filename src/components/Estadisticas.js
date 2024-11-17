import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Button, Text } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../connection/firebaseConfig';
import { captureRef } from 'react-native-view-shot';
import { jsPDF } from 'jspdf';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const PALETA_COLORES = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
  '#E7E9ED', '#4D5360', '#70CAD1', '#3D7EAA', '#F3E59A', '#F3B59A'
];

export default function Estadisticas() {
  const [dataEquipos, setDataEquipos] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [isChartReady, setIsChartReady] = useState(false);
  const [coloresEtiquetas, setColoresEtiquetas] = useState({});
  const chartRef = useRef();

  useEffect(() => {
    if (dataEquipos.datasets[0].data.length > 0) {
      setIsChartReady(true);
    }
  }, [dataEquipos]);

  const generarPDF = async () => {
    if (!isChartReady) {
      Alert.alert('Error', 'El gráfico aún no está listo para ser capturado.');
      return;
    }

    try {
      const uri = await captureRef(chartRef, {
        format: 'png',
        quality: 0.8,
      });
      
      const doc = new jsPDF();
      doc.text("Reporte de Equipos por Categoría", 10, 10);

      const chartImage = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      doc.addImage(chartImage, "PNG", 10, 20, 150, 110);

      dataEquipos.labels.forEach((label, index) => {
        const value = dataEquipos.datasets[0].data[index];
        doc.text(`${label}: ${value} equipos`, 10, 140 + index * 10);
      });

      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const fileUri = `${FileSystem.documentDirectory}reporte_equipos.pdf`;

      await FileSystem.writeAsStringAsync(fileUri, pdfBase64, {
        encoding: FileSystem.EncodingType.Base64
      });

      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error("Error al generar o compartir el PDF: ", error);
      Alert.alert("Error", "No se pudo generar el PDF");
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'Equipos'), (snapshot) => {
      const conteoEquiposCategoria = {};
      let nuevosColores = {...coloresEtiquetas};

      snapshot.forEach((doc) => {
        const datosBD = doc.data();
        const { categoria } = datosBD;

        if (categoria) {
          conteoEquiposCategoria[categoria] = (conteoEquiposCategoria[categoria] || 0) + 1;
          if (!nuevosColores[categoria]) {
            let colorIndex = Object.keys(nuevosColores).length % PALETA_COLORES.length;
            nuevosColores[categoria] = PALETA_COLORES[colorIndex];
          }
        }
      });

      setColoresEtiquetas(nuevosColores);

      const labels = Object.keys(conteoEquiposCategoria);
      const dataCounts = Object.values(conteoEquiposCategoria);

      setDataEquipos({
        labels,
        datasets: [{ data: dataCounts }],
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estadísticas de Equipos por Categoría</Text>
      <View ref={chartRef} collapsable={false} style={styles.chartContainer}>
        <PieChart
          data={dataEquipos.datasets[0].data.map((value, index) => ({
            name: dataEquipos.labels[index],
            population: value,
            color: coloresEtiquetas[dataEquipos.labels[index]],
            legendFontColor: "#000",
            legendFontSize: 15,
          }))}
          width={300}
          height={220}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
      <Button title="Generar y Compartir PDF" onPress={generarPDF} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  chartContainer: {
    width: 300,
    height: 220,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
});