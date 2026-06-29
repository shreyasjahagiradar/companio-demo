import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { Facebook, Instagram, Linkedin, ExternalLink } from 'lucide-react-native';
import { colors, typography } from '@/constants/theme';

export default function Footer() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <View style={styles.container}>
      <View style={[styles.contentWrapper, isMobile && styles.contentWrapperMobile]}>
        
        {/* Column 1: Quick Links */}
        <View style={[styles.column, isMobile && styles.columnMobile]}>
          <Text style={styles.heading}>Quick Links</Text>
          <TouchableOpacity><Text style={styles.link}>My Dashboard</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.link}>Daily Log</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.link}>Clinical Reports</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.link}>Diet & Supplements</Text></TouchableOpacity>
          
          <TouchableOpacity style={styles.outlineButton}>
            <ExternalLink size={14} color="#0E2319" style={{ marginRight: 6 }} />
            <Text style={styles.outlineButtonText}>Patient Portal</Text>
          </TouchableOpacity>
        </View>

        {/* Column 2: Features */}
        <View style={[styles.column, isMobile && styles.columnMobile]}>
          <Text style={styles.heading}>Features</Text>
          <TouchableOpacity><Text style={styles.link}>Biomarker Tracking</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.link}>Symptom Logging</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.link}>Supplement Guide</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.link}>Health Insights</Text></TouchableOpacity>
        </View>

        {/* Column 3: Support */}
        <View style={[styles.column, isMobile && styles.columnMobile]}>
          <Text style={styles.heading}>Support</Text>
          <TouchableOpacity><Text style={styles.link}>Contact Practitioner</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.link}>Help Center</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.link}>Privacy Policy</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.link}>Terms of Service</Text></TouchableOpacity>
        </View>

        {/* Column 4: Social & Subscribe */}
        <View style={[styles.column, isMobile && styles.columnMobile, styles.rightColumn]}>
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialIcon}>
              <Facebook size={16} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <Linkedin size={16} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <Instagram size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Book Consultation</Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <Text style={styles.copyright}>© {new Date().getFullYear()} | MendRx Companion</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0E2319', // MendRx Dark Green Theme
    width: '100%',
    paddingTop: 40,
    marginTop: 20, // Reduced from 40 for smoother integration
  },
  contentWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: '10%',
    paddingBottom: 40,
    flexWrap: 'wrap',
    gap: 30,
  },
  contentWrapperMobile: {
    flexDirection: 'column',
    paddingHorizontal: 20,
  },
  column: {
    flex: 1,
    minWidth: 150,
  },
  columnMobile: {
    marginBottom: 20,
  },
  rightColumn: {
    alignItems: 'flex-start',
  },
  heading: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  link: {
    color: '#8A9A86', // MendRx Sage Green
    fontSize: 14,
    marginBottom: 12,
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C6EE34', // MendRx Lime Accent
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  outlineButtonText: {
    color: '#0E2319',
    fontWeight: '700',
    fontSize: 14,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  socialIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#304D3C',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  primaryButton: {
    backgroundColor: colors.primary, // MendRx Green
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#304D3C',
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: '#304D3C',
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: '5%',
  },
  copyright: {
    color: '#8A9A86',
    fontSize: 12,
    fontWeight: '600',
  },
});
