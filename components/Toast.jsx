const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { AsyncComponent, Tooltip } = require('powercord/components');

const Clickable = AsyncComponent.from(getModuleByDisplayName('Clickable'));

Object.assign(exports, {
  Button: AsyncComponent.from(getModule(m => m.name === 'm'))
});

(async () => {
  const Button = await getModule(m => m.name === 'm', true, true);
  [ 'Colors', 'Hovers', 'Looks', 'Sizes' ].forEach(prop => exports.Button[prop] = Button[prop]);
})();

/* eslint-disable multiline-ternary */
const Toast = class Toast extends React.PureComponent {
  constructor (props) {
    super(props);

    this.main = props.main;
    this.state = {
      leaving: false
    };

    this.styles = {
      regular: 'r',
      light: 'l',
      duotone: 'd',
      brands: 'b'
    };
  }

  render () {
    const { state } = this;
    const { Button } = exports;

    return (
      <div
        className={[ 'powercord-toast', state.leaving ? 'leaving' : '' ].filter(Boolean).join(' ')}
        data-toast-type={this.props.type || 'info'}
        style={this.props.style}
      >
        {this.props.header && (
          <div className='header'>
            {this.props.icon !== false && (
              <Tooltip
                text={`Type: ${this.props.type
                  ? this.props.type.replace(/\w\S*/g, (text) => text.charAt(0).toUpperCase() + text.substr(1).toLowerCase())
                  : 'Info'
                }`}
                position='left'
              >
                <div className='icon'>
                  {this.props.image ? this.getHeaderImage() : this.props.icon
                    ? this.getHeaderIcon()
                    : <div className={`fad fa-${this.props.type ? Toast.Types[(this.props.type).toUpperCase()] : Toast.Types.INFO} fa-fw`} />}
                </div>
              </Tooltip>
            )}

            {this.props.header}

            <Clickable
              className='dismiss'
              onClick={() => {
                this.setState({ leaving: true });
                return this.main.closeToast(this.props.id);
              }}
            />
          </div>
        )}

        {(this.props.content || (this.props.buttons && this.props.buttons.filter(Boolean).length > 0)) && (
          <div className='body'>
            {this.props.content && (
              <div className='content'>
                {this.props.content}
              </div>
            )}

            <div className='buttons'>
              {Array.isArray(this.props.buttons) && (
                this.props.buttons.filter(Boolean).map(button => (
                  <Button
                    className='button'
                    size={button.size
                      ? Button.Sizes[(button.size).toUpperCase()]
                      : Button.Sizes.SMALL}
                    color={button.danger ? Button.Colors.RED : button.color
                      ? Button.Colors[typeof button.color === 'string' ? (button.color).toUpperCase() : '']
                      : Button.Colors.TRANSPARENT}
                    look={button.danger ? Button.Looks.OUTLINED : button.type
                      ? Button.Looks[(button.type).toUpperCase()]
                      : Button.Looks.FILLED}
                    style={button.color ? this.getButtonStyle(button) : null}
                    onClick={() => {
                      if (button.onClick) {
                        button.onClick();
                      }

                      return (this.setState({ leaving: true }), this.main.closeToast(this.props.id));
                    }}
                  >
                    {button.text}
                  </Button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  getHeaderImage () {
    return <img alt='' className={[ this.props.imageClassName || null ].filter(Boolean).join(' ')}
      src={this.props.image} />;
  }

  getHeaderIcon () {
    const styleRegex = new RegExp(/[a-z]+(?!.*-)/);
    const style = Object.keys(this.styles).find(style => style === this.props.icon.split(' ')[0].match(styleRegex)[0]);
    const icon = `fa-${this.props.icon.replace(`-${style}`, '')} fa-fw`;

    let prefix = 'fas';

    if (this.styles[style]) {
      prefix = `fa${this.styles[style]}`;
    }

    return <div className={`${prefix} ${icon}`} />;
  }

  getButtonStyle (button) {
    let { style } = button;
    const { isValidHex } = getModule([ 'hex2rgb' ], false);

    if (isValidHex(button.color)) {
      style = { backgroundColor: button.color };
    } else {
      let foreground, background;

      if (Array.isArray(button.color)) {
        [ foreground, background ] = button.color;
      } else if (typeof button.color === 'object') {
        ({ foreground, background } = button.color);

        if (button.color.primary || button.color.secondary) {
          ({ primary: foreground, secondary: background } = button.color);
        }
      }

      return { color: foreground && isValidHex(foreground) ? foreground : null,
        borderColor: background && isValidHex(background) ? background : null };
    }

    return style;
  }
};

Toast.Types = {
  INFO: 'info-square',
  WARNING: 'exclamation-square',
  DANGER: 'times-square',
  SUCCESS: 'check-square'
};

module.exports = Toast;
