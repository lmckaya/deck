'use strict';

const angular = require('angular');

module.exports = angular
  .module('spinnaker.azure.serverGroup.transformer', [])
  .factory('azureServerGroupTransformer', function() {
    function normalizeServerGroup(serverGroup) {
      return serverGroup;
    }

    function convertServerGroupCommandToDeployConfiguration(command) {
      var tempImage;

      if (command.viewState.mode === 'editPipeline' || command.viewState.mode === 'createPipeline') {
        tempImage = {
          imageName: '',
          isCustom: 'true',
          publisher: '',
          offer: '',
          sku: '',
          version: '',
          region: command.region,
          uri: '',
          ostype: '',
        };
      } else {
        tempImage = command.selectedImage;
      }

      var configuration = {
        name: command.application,
        cloudProvider: command.selectedProvider,
        application: command.application,
        stack: command.stack,
        strategy: command.strategy,
        detail: command.freeFormDetails,
        freeFormDetails: command.freeFormDetails,
        account: command.credentials,
        selectedProvider: 'azure',
        vnet: command.vnet,
        vnetResourceGroup: command.vnetResourceGroup,
        subnet: command.subnet,
        capacity: {
          useSourceCapacity: false,
          min: command.sku.capacity,
          max: command.sku.capacity,
        },
        credentials: command.credentials,
        region: command.region,
        securityGroupName: command.securityGroupName,
        loadBalancerName: command.loadBalancerName,
        user: '[anonymous]',
        upgradePolicy: 'Manual',
        type: 'createServerGroup',
        image: tempImage,
        sku: {
          name: 'Standard_DS1_v2',
          tier: 'Standard',
          capacity: command.sku.capacity,
        },
        viewState: command.viewState,
        osConfig: {
          customData: command.osConfig ? command.osConfig.customData : null,
        },
        customScriptsSettings: {
          fileUris: null,
          commandToExecute: '',
        },
      };

      if (typeof command.stack !== 'undefined') {
        configuration.name = configuration.name + '-' + command.stack;
      }
      if (typeof command.freeFormDetails !== 'undefined') {
        configuration.name = configuration.name + '-' + command.freeFormDetails;
      }

      if (typeof command.customScriptsSettings !== 'undefined') {
        configuration.customScriptsSettings.commandToExecute = command.customScriptsSettings.commandToExecute;
        if (
          typeof command.customScriptsSettings.fileUris !== 'undefined' &&
          command.customScriptsSettings.fileUris != ''
        ) {
          var fileUrisTemp = command.customScriptsSettings.fileUris;
          if (typeof fileUrisTemp !== 'string') fileUrisTemp = fileUrisTemp[0];
          if (fileUrisTemp.includes(',')) {
            configuration.customScriptsSettings.fileUris = fileUrisTemp.split(',');
          } else if (fileUrisTemp.includes(';')) {
            configuration.customScriptsSettings.fileUris = fileUrisTemp.split(';');
          } else {
            configuration.customScriptsSettings.fileUris = [fileUrisTemp];
          }

          configuration.customScriptsSettings.fileUris.forEach(function(v, index) {
            configuration.customScriptsSettings.fileUris[index] = v.trim();
          });
        }
      }

      if (command.instanceType) {
        let vmsku = command.instanceType;
        configuration.instanceType = command.instanceType;
        configuration.sku.name = vmsku;
        configuration.sku.tier = vmsku.substring(0, vmsku.indexOf('_'));
      }

      // Default to an empty list of health provider names for now.
      configuration.interestingHealthProviderNames = [];

      return configuration;
    }

    return {
      convertServerGroupCommandToDeployConfiguration: convertServerGroupCommandToDeployConfiguration,
      normalizeServerGroup: normalizeServerGroup,
    };
  });
