import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { palette } from '../../constants/Colors'; // Adjust path as necessary

interface DayCarouselProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

interface DayItem {
  date: Date;
  dayOfMonth: string;
  dayOfWeek: string;
}

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const CIRCLE_DIAMETER = 44;
const ITEM_MARGIN_HORIZONTAL = 8;
const LAYOUT_ITEM_WIDTH = CIRCLE_DIAMETER + (ITEM_MARGIN_HORIZONTAL * 2);

const getItemLayout = (data: Array<DayItem> | null | undefined, index: number) => ({
  length: LAYOUT_ITEM_WIDTH, // Width of a single item
  offset: LAYOUT_ITEM_WIDTH * index, // Offset of the item from the start of the list
  index,
});

const onScrollToIndexFailed = (info: {
  index: number;
  highestMeasuredFrameIndex: number;
  averageItemLength: number;
}) => {
  console.warn('[DayCarousel] Failed to scroll to index:', info.index, 'More info:', info);
  // Potentially, you could use flatListRef.current.scrollToOffset if a simple scroll is needed as fallback
  // For now, just logging.
};

const DayCarousel: React.FC<DayCarouselProps> = ({ selectedDate, onDateSelect }) => {
  const days: DayItem[] = [];
  const today = new Date();
  const dayOfWeekFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    days.push({
      date,
      dayOfMonth: date.getDate().toString(),
      dayOfWeek: dayOfWeekFormatter.format(date).substring(0, 3), // e.g., "Tue"
    });
  }

  const renderItem = ({ item }: { item: DayItem }) => {
    const isSelected = isSameDay(item.date, selectedDate);
    const isToday = isSameDay(item.date, new Date());
    const isPast = item.date < new Date() && !isToday;

    let circleStyle: any = styles.circle;
    let dayOfMonthStyle: any = styles.dayOfMonth;
    let dayOfWeekStyle: any = styles.dayOfWeek;

    if (isToday) {
      circleStyle = { ...circleStyle, borderWidth: 2, borderColor: palette.accent };
      dayOfMonthStyle = { ...dayOfMonthStyle, color: palette.accent, fontWeight: 'bold' };
      dayOfWeekStyle = { ...dayOfWeekStyle, color: palette.accent };
    } else if (isPast) {
      circleStyle = { ...circleStyle, borderStyle: 'dashed', borderColor: palette.inactive, borderWidth: 1 };
      dayOfMonthStyle = { ...dayOfMonthStyle, color: palette.inactive };
      dayOfWeekStyle = { ...dayOfWeekStyle, color: palette.inactive };
    } 
    // Future date opacity 0.3 - current logic generates last 7 days, so no 'future' relative to today in list.
    // If data changes to include future dates, this is where that logic would go.
    // else if (item.date > new Date() && !isToday) { // Added !isToday to ensure future styling doesn't override today
    //   circleStyle = { ...circleStyle, opacity: 0.3 }; 
    //   dayOfMonthStyle = { ...dayOfMonthStyle, opacity: 0.3 };
    //   dayOfWeekStyle = { ...dayOfWeekStyle, opacity: 0.3 };
    // }

    if (isSelected) {
      circleStyle = { ...circleStyle, backgroundColor: palette.accent + '33' }; 
      if (!isToday) { 
        circleStyle = { ...circleStyle, borderWidth: 2, borderColor: palette.accent, borderStyle: 'solid' };
        dayOfMonthStyle = { ...dayOfMonthStyle, color: palette.primary, fontWeight: 'bold' };
        dayOfWeekStyle = { ...dayOfWeekStyle, color: palette.primary };
      }
    }

    return (
      <TouchableOpacity onPress={() => onDateSelect(item.date)} style={styles.itemContainer}>
        <Text style={dayOfWeekStyle}>{item.dayOfWeek.toUpperCase()}</Text>
        <View style={circleStyle}>
          <Text style={dayOfMonthStyle}>{item.dayOfMonth}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={days}
        renderItem={renderItem}
        keyExtractor={(item: DayItem) => item.date.toISOString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContentContainer}
        initialScrollIndex={days.length > 0 ? days.length - 1 : 0} // Scroll to the last item (Today)
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={onScrollToIndexFailed}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    height: 80, 
  },
  listContentContainer: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  itemContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
    paddingVertical: 5,
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.surface, 
    borderWidth: 1,
    borderColor: palette.inactive + '50',
    marginTop: 4, 
  },
  dayOfMonth: {
    fontSize: 16,
    fontWeight: '500',
    color: palette.primary,
  },
  dayOfWeek: {
    fontSize: 12,
    color: palette.inactive,
    marginBottom: 2,
  },
});

export default DayCarousel;
