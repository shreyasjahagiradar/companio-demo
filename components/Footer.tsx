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
        
        <View style={styles.linksContainer}>
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

          {/* Column 3: Support */}
          <View style={[styles.column, isMobile && styles.columnMobile]}>
            <Text style={styles.heading}>Support</Text>
            <TouchableOpacity><Text style={styles.link}>Contact Practitioner</Text></TouchableOpacity>
            <TouchableOpacity><Text style={styles.link}>Help Center</Text></TouchableOpacity>
            <TouchableOpacity><Text style={styles.link}>Privacy Policy</Text></TouchableOpacity>
            <TouchableOpacity><Text style={styles.link}>Terms of Service</Text></TouchableOpacity>
          </View>
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
    paddingTop: 16, 
    marginTop: 10, 
  },
  contentWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: '10%',
    paddingBottom: 16, 
    flexWrap: 'wrap',
    gap: 16, 
  },
  contentWrapperMobile: {
    paddingHorizontal: 16,
    gap: 16,
  },
  linksContainer: {
    flexDirection: 'row',
    flex: 2,
    minWidth: '60%',
    justifyContent: 'space-between',
    gap: 12,
  },
  column: {
    flex: 1,
    minWidth: 120, // Reduced from 150 to ensure they fit side-by-side
  },
  columnMobile: {
    marginBottom: 12,
  },
  rightColumn: {
    alignItems: 'flex-start',
  },
  heading: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8, 
    letterSpacing: 0.5,
  },
  link: {
    color: '#8A9A86', // MendRx Sage Green
    fontSize: 13,
    marginBottom: 4, 
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C6EE34', // MendRx Lime Accent
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  outlineButtonText: {
    color: '#0E2319',
    fontWeight: '700',
    fontSize: 13,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12, 
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
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#304D3C',
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 13,
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: '#304D3C',
    paddingVertical: 10, 
    alignItems: 'center',
    marginHorizontal: '5%',
  },
  copyright: {
    color: '#8A9A86',
    fontSize: 12,
    fontWeight: '600',
  },
});
