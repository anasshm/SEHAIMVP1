import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { palette } from '@/constants/Colors';
import { 
  useCurrentPageNumber, 
  useProgressPercentage, 
  usePageInfo,
  useGoToPage 
} from '@/utils/onboarding/navigationHelper';
import { ONBOARDING_PAGE_MAP, TOTAL_ONBOARDING_PAGES } from '@/utils/onboarding/onboardingConfig';

export default function TestNewNavigationScreen() {
  const router = useRouter();
  const pageInfo = usePageInfo();
  const goToPage = useGoToPage();
  
  return (
    <View style={{ flex: 1, backgroundColor: 'white', padding: 20 }}>
      <Stack.Screen options={{ headerTitle: 'Test New Navigation' }} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
          Navigation System Test
        </Text>
        
        {/* Current Page Info */}
        <View style={{ 
          backgroundColor: '#f0f0f0', 
          padding: 15, 
          borderRadius: 10, 
          marginBottom: 20 
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Current Page Info:
          </Text>
          <Text>Page Number: {pageInfo.pageNumber}</Text>
          <Text>Screen Name: {pageInfo.screenName}</Text>
          <Text>Progress: {pageInfo.progressPercentage}%</Text>
          <Text>Total Pages: {pageInfo.totalPages}</Text>
          <Text>Is First Page: {pageInfo.isFirstPage ? 'Yes' : 'No'}</Text>
          <Text>Is Last Page: {pageInfo.isLastPage ? 'Yes' : 'No'}</Text>
        </View>
        
        {/* Page Mapping */}
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          Page Mapping:
        </Text>
        
        {Object.entries(ONBOARDING_PAGE_MAP).map(([pageNum, screenName]) => {
          const isCurrentPage = parseInt(pageNum) === pageInfo.pageNumber;
          
          return (
            <TouchableOpacity
              key={pageNum}
              onPress={() => goToPage(parseInt(pageNum))}
              style={{
                backgroundColor: isCurrentPage ? palette.primary : '#f0f0f0',
                padding: 10,
                marginBottom: 5,
                borderRadius: 5,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ 
                color: isCurrentPage ? 'white' : 'black',
                fontWeight: isCurrentPage ? 'bold' : 'normal' 
              }}>
                Page {pageNum}: {screenName}
              </Text>
              <Text style={{ 
                color: isCurrentPage ? 'white' : '#666',
                fontSize: 12 
              }}>
                {Math.round((parseInt(pageNum) / TOTAL_ONBOARDING_PAGES) * 100)}%
              </Text>
            </TouchableOpacity>
          );
        })}
        
        {/* Test Actions */}
        <View style={{ marginTop: 30 }}>
          <TouchableOpacity
            onPress={() => router.replace('/(onboarding)/_layout_new')}
            style={{
              backgroundColor: '#4CAF50',
              padding: 15,
              borderRadius: 10,
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
              Test with New Layout
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => router.replace('/(onboarding)/_layout')}
            style={{
              backgroundColor: '#2196F3',
              padding: 15,
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
              Back to Old Layout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
} 