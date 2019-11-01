const { Plugin } = require('powercord/entities');
const { React, getModule } = require('powercord/webpack');
const { getOwnerInstance, waitFor } = require('powercord/util');
const { inject, uninject } = require('powercord/injector');

const Toast = require('./components/Toast');

module.exports = class Toasts extends Plugin {
  constructor () {
    super();

    this.toasts = [];
  }

  async startPlugin () {
    this.classes = {
      ...await getModule([ 'app' ])
    };

    this.loadCSS(require('path').resolve(__dirname, 'style.scss'));
    this._patchToasts();

    // placeholder toast for testing purposes
    this.sendToast({
      id: 'placeholder',
      header: 'You\'ve got mail!',
      content: 'Some plug-ins require your attention. Open "Updater" to find out more!',
      buttons: [ {
        text: 'Update Now!',
        color: 'green',
        type: 'outlined'
      }, {
        text: 'Open Updater',
        color: 'blue',
        type: 'ghost'
      } ]
    });
  }

  pluginWillUnload () {
    uninject('pc-toasts-render');
  }

  sendToast (toast) {
    if (!this.toasts.find(t => toast.id === t.id)) {
      this.toasts.push(toast);
      this.updateContainer();
    }
  }

  closeToast (toastId) {
    this.toasts = this.toasts.filter(t => t.id !== toastId);

    setTimeout(() => {
      this.updateContainer();
    }, 500);
  }

  async _patchToasts () {
    const instance = getOwnerInstance(await waitFor(`.${this.classes.app.split(' ')[0]}`));
    inject('pc-toasts-render', instance.__proto__, 'render', (_, res) => {
      const ToastContainer = React.createElement('div', {
        className: 'powercord-toastsContainer'
      }, this._renderToasts());

      const toastContainer = res.props.children.find(child => child.props && child.props.className === 'powercord-toastsContainer');
      if (toastContainer) {
        toastContainer.props.children = this._renderToasts();
      } else {
        res.props.children.push(ToastContainer);
      }

      return res;
    });

    instance.forceUpdate();
  }

  _renderToasts () {
    if (this.toasts.length > 0) {
      const toast = this.toasts[this.toasts.length - 1];
      return React.createElement(Toast, {
        ...toast,
        main: this
      });
    }

    return null;
  }

  async updateContainer () {
    const toastsContainer = await waitFor('.powercord-toastsContainer');
    return getOwnerInstance(toastsContainer)._reactInternalFiber.return.stateNode.forceUpdate();
  }
};
