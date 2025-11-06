import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDate } from '../utils/formatters';


const CustomDatePicker = ({ // Renomeei para ser mais genérico
    label, 
    valor, // O valor Date atual
    onChange, // A função de callback para o componente pai
    mode = 'date'
}) => {
    // 1. **Correção:** useState deve ser importado e usado dentro do componente
    const [showPicker, setShowPicker] = useState(false); 

    // O DateTimePicker usa onChange para capturar a mudança
    const onDateChange = (event, selectedDate) => {
        setShowPicker(false);
        if (event.type === 'set' && selectedDate) {
            onChange(selectedDate);
        }
    };

    const show = () => {
        setShowPicker(true);
    };

    // Garantir que valor seja um objeto Date válido
    const dateValue = valor ? (typeof valor === 'string' ? new Date(valor) : valor) : new Date();

    return (
        <View style={styles.container}>
            {/* O Pressable é o campo que o usuário interage */}
            <Pressable onPress={show} style={styles.pressableArea}>
                <Text style={styles.label}>{label}</Text>
                {/* 5. **Melhoria:** Passando 'mode' para a formatação correta */}
                <Text style={styles.dateText}>{formatDate(dateValue, mode)}</Text>
            </Pressable>
            
            {showPicker && (
                <DateTimePicker
                    value={dateValue}
                    mode={mode}
                    display="default"
                    onChange={onDateChange}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    pressableArea: { // Estilo para a área clicável que mostra o valor
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    label: {
        fontSize: 14,
        color: '#666',
    },
    dateText: {
        fontSize: 16,
        color: '#333',
        marginTop: 2,
    },
});

export default CustomDatePicker;