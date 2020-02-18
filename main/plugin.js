'use strict';

const {app, shell} = require('electron');
const path = require('path');
const fs = require('fs');
const PluginConfig = require('./utils/plugin-config');
const {showError} = require('./utils/errors');

class Plugin {
  constructor(pluginName) {
    this.pluginName = pluginName;

    const cwd = path.join(app.getPath('userData'), 'plugins');
    const pluginPath = path.join(cwd, 'node_modules', pluginName);
    const {homepage, links} = JSON.parse(fs.readFileSync(path.join(pluginPath, 'package.json'), 'utf8'));
    this.link = homepage || (links && links.homepage);

    try {
      this.plugin = require(pluginPath);
    } catch (error) {
      showError(error, {title: `Something went wrong while loading “${pluginName}”`});
      this.plugin = {shareServices: [], recordServices: []};
    }

    this.config = new PluginConfig(pluginName, this.plugin);
    this.validators = this.config.validators;
  }

  isConfigValid() {
    return this.config.isConfigValid();
  }

  get isSharePlugin() {
    return this.shareServices.length > 0;
  }

  get isRecordingPlugin() {
    return this.recordServices.length > 0;
  }

  get recordServices() {
    return this.plugin.recordServices || [];
  }

  get shareServices() {
    return this.plugin.shareServices || [];
  }

  openConfig() {
    this.config.openInEditor();
  }

  viewOnGithub() {
    shell.openExternal(this.link);
  }
}

module.exports = Plugin;
