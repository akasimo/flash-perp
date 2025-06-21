// Wallet connection and management modal

'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { useWallet, useNetworkStatus } from '@/lib/hooks/useWallet';
import { LINKS } from '@/lib/utils/constants';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { state, connect, disconnect, switchNetwork } = useWallet();
  const { needsNetworkSwitch, currentNetwork } = useNetworkStatus();
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await connect();
      onClose();
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  const handleSwitchNetwork = async () => {
    setIsLoading(true);
    try {
      await switchNetwork('TESTNET');
    } catch (error) {
      console.error('Network switch failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyAddress = () => {
    if (state.address) {
      navigator.clipboard.writeText(state.address);
      // You might want to show a toast notification here
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-gray-900 border border-gray-700 shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">
              {state.isConnected ? 'Wallet Connected' : 'Connect Wallet'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {!state.isConnected ? (
              // Not connected state
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 18v1a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v13z"/>
                      <path d="M21 6H3"/>
                      <path d="M16 6V3a1 1 0 00-1-1H9a1 1 0 00-1 1v3"/>
                    </svg>
                  </div>
                  <p className="text-gray-300 mb-6">
                    Connect your Freighter wallet to start trading perpetuals on Stellar.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  onClick={handleConnect}
                  leftIcon={
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 18v1a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v13z"/>
                      <path d="M21 6H3"/>
                      <path d="M16 6V3a1 1 0 00-1-1H9a1 1 0 00-1 1v3"/>
                    </svg>
                  }
                >
                  Connect Freighter
                </Button>

                {state.error && (
                  <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg">
                    <p className="text-red-300 text-sm">{state.error}</p>
                    {state.error.includes('not installed') && (
                      <a 
                        href={LINKS.FREIGHTER_INSTALL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm underline mt-2 inline-block"
                      >
                        Install Freighter Wallet
                      </a>
                    )}
                  </div>
                )}

                <div className="text-center pt-4 border-t border-gray-700">
                  <p className="text-gray-400 text-sm">
                    Don't have Freighter?{' '}
                    <a 
                      href={LINKS.FREIGHTER_INSTALL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      Get it here
                    </a>
                  </p>
                </div>
              </div>
            ) : (
              // Connected state
              <div className="space-y-4">
                {/* Network warning */}
                {needsNetworkSwitch && (
                  <div className="p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h4 className="text-yellow-400 font-medium">Wrong Network</h4>
                        <p className="text-yellow-300 text-sm mt-1">
                          You're on {currentNetwork}. Please switch to Stellar Testnet.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                          loading={isLoading}
                          onClick={handleSwitchNetwork}
                        >
                          Switch to Testnet
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Account info */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-sm">Connected Account</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span className="text-green-400 text-sm">Connected</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-white font-mono text-sm">
                      {state.address}
                    </span>
                    <button
                      onClick={copyAddress}
                      className="text-gray-400 hover:text-white transition-colors p-1"
                      title="Copy address"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Network info */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Network</span>
                    <span className="text-white text-sm">{currentNetwork}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t border-gray-700">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={onClose}
                  >
                    Close
                  </Button>
                  <Button
                    variant="danger"
                    fullWidth
                    onClick={handleDisconnect}
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}