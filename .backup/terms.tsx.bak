import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

export default function TermsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[Colors.compass.backgroundGradientStart, Colors.compass.backgroundGradientEnd]}
      style={styles.container}
    >
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Terms of Service</Text>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last Updated: February 2026</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By downloading, installing, or using the Compass Direction application (the App), you agree to be bound by these Terms of Service (the Terms). If you do not agree to these Terms, please do not use the App.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.paragraph}>
            The App provides compass functionality that displays directional information toward user-specified geographic locations. The App uses your device&apos;s sensors (magnetometer, accelerometer) and location services to provide this functionality.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Accuracy Disclaimer</Text>
          <Text style={styles.paragraph}>
            The compass direction provided by this App is for informational and reference purposes only. The accuracy of directional information depends on various factors including:{'\n\n'}
            • Device sensor calibration and hardware quality{'\n'}
            • Environmental magnetic interference{'\n'}
            • GPS signal strength and accuracy{'\n'}
            • Software and operating system limitations{'\n\n'}
            <Text style={styles.bold}>The App should not be used as the sole means of navigation, especially in situations where accuracy is critical to safety.</Text> We strongly recommend using professional navigation equipment for travel, hiking, maritime, or aviation purposes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Privacy and Data Collection</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Location Data:</Text> The App requires access to your device&apos;s location services to calculate distances and directions. This location data is processed locally on your device and is not transmitted to external servers.{'\n\n'}
            <Text style={styles.bold}>Sensor Data:</Text> The App accesses your device&apos;s magnetometer and accelerometer data solely for providing compass functionality. This data is not stored or transmitted.{'\n\n'}
            <Text style={styles.bold}>User Preferences:</Text> Your saved target locations are stored locally on your device using standard device storage mechanisms.{'\n\n'}
            We do not collect, store, or share any personal information with third parties.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Permissions</Text>
          <Text style={styles.paragraph}>
            The App requires the following device permissions:{'\n\n'}
            • <Text style={styles.bold}>Location Services:</Text> Required to determine your current position for distance calculations and directional guidance.{'\n\n'}
            • <Text style={styles.bold}>Motion Sensors:</Text> Required to access the magnetometer (compass) and accelerometer for directional readings.{'\n\n'}
            You may revoke these permissions at any time through your device settings, though this will limit the App&apos;s functionality.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE APP IS PROVIDED AS-IS WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.{'\n\n'}
            IN NO EVENT SHALL THE DEVELOPERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE APP, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. User Responsibilities</Text>
          <Text style={styles.paragraph}>
            You are responsible for:{'\n\n'}
            • Ensuring your device&apos;s compass is properly calibrated{'\n'}
            • Understanding the limitations of digital compass technology{'\n'}
            • Using the App in compliance with local laws and regulations{'\n'}
            • Not relying solely on this App for critical navigation needs
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            All content, features, and functionality of the App are owned by the developers and are protected by international copyright, trademark, and other intellectual property laws.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting within the App. Your continued use of the App after any changes constitutes acceptance of the new Terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Contact</Text>
          <Text style={styles.paragraph}>
            For questions or concerns about these Terms of Service, please contact us through the App&apos;s support channels.
          </Text>
        </View>

        <View style={styles.acknowledgment}>
          <Text style={styles.acknowledgmentText}>
            By using this App, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.compass.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
  },
  lastUpdated: {
    fontSize: 13,
    color: Colors.compass.textSecondary,
    marginBottom: 24,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.compass.gold,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    color: Colors.compass.text,
    lineHeight: 24,
  },
  bold: {
    fontWeight: '600',
  },
  acknowledgment: {
    marginTop: 20,
    padding: 20,
    backgroundColor: Colors.compass.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.compass.border,
  },
  acknowledgmentText: {
    fontSize: 14,
    color: Colors.compass.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
});
