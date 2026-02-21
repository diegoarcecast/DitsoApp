import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, borderRadius } from '../theme';

interface ProgressBarProps {
    percentage: number; // 0 a 100
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
    const clampedPct = Math.min(100, Math.max(0, percentage));

    const getBarColor = () => {
        if (clampedPct >= 90) return colors.error;
        if (clampedPct >= 70) return '#F59E0B'; // amarillo
        return '#10B981'; // verde
    };

    return (
        <View style={styles.track}>
            <View
                style={[
                    styles.fill,
                    { width: `${clampedPct}%` as any, backgroundColor: getBarColor() },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    track: {
        height: 8,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.gray200 ?? '#E5E7EB',
        overflow: 'hidden',
    },
    fill: {
        height: 8,
        borderRadius: borderRadius.sm,
    },
});
