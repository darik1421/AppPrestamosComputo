import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Button, Text } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../connection/firebaseConfig';
import { captureRef } from 'react-native-view-shot';
import { jsPDF } from 'jspdf';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

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
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (dataEquipos.datasets[0].data.length > 0) {
      setIsChartReady(true);
    }
  }, [dataEquipos]);

  const generarPDF = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const total = dataEquipos.datasets[0].data.reduce((a, b) => a + b, 0);
      let acumulado = 0;
      
      const pieChartSVG = `
        <svg width="200" height="200" viewBox="-100 -100 200 200">
          ${dataEquipos.datasets[0].data.map((value, index) => {
            const porcentaje = (value / total) * 100;
            const anguloInicio = (acumulado / total) * 360;
            const anguloFin = ((acumulado + value) / total) * 360;
            acumulado += value;
            
            const inicioX = Math.cos((anguloInicio - 90) * Math.PI / 180) * 100;
            const inicioY = Math.sin((anguloInicio - 90) * Math.PI / 180) * 100;
            const finX = Math.cos((anguloFin - 90) * Math.PI / 180) * 100;
            const finY = Math.sin((anguloFin - 90) * Math.PI / 180) * 100;
            
            const esGranArco = porcentaje > 50 ? 1 : 0;
            
            return `
              <path d="M 0 0 L ${inicioX} ${inicioY} A 100 100 0 ${esGranArco} 1 ${finX} ${finY} Z"
                    fill="${coloresEtiquetas[dataEquipos.labels[index]]}"
              />
            `;
          }).join('')}
        </svg>
      `;

      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .chart-container { 
                border: 1px solid #ccc;
                padding: 20px;
                margin: 20px 0;
                border-radius: 8px;
                text-align: center;
              }
              .legend-item {
                display: flex;
                align-items: center;
                margin: 10px 0;
                justify-content: center;
              }
              .color-box {
                width: 20px;
                height: 20px;
                margin-right: 10px;
                border-radius: 3px;
              }
            </style>
          </head>
          <body>
            <h1>Reporte de Equipos por Categoría</h1>
            <div class="chart-container">
              ${pieChartSVG}
              <div class="legend">
                ${dataEquipos.labels.map((label, index) => `
                  <div class="legend-item">
                    <div class="color-box" style="background-color: ${coloresEtiquetas[label]}"></div>
                    <div>${label}: ${dataEquipos.datasets[0].data[index]} equipos 
                      (${(dataEquipos.datasets[0].data[index] / total * 100).toFixed(1)}%)
                    </div>
                  </div>
                `).join('')}
              </div>
              <p>Total de equipos: ${total}</p>
              <p>Fecha de generación: ${new Date().toLocaleDateString()}</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });

      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartir reporte de equipos'
      });
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', `No se pudo generar el PDF: ${error.message}`);
    } finally {
      setIsGenerating(false);
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