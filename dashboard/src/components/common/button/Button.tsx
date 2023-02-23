import { FunctionComponent } from 'react';
import { Icon } from '../icon';
import { IButtonProps, TButtonVariant } from './types';

export const Button: FunctionComponent<IButtonProps> = ({
  size = 'medium',
  isLoader = false,
  variant = 'primary',
  title,
  icon,
  iconFill,
  iconOnly,
  ...props
}) => {
  const sizeDict = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  };

  const heightDict = {
    small: 'h-6',
    medium: 'h-8',
    large: 'h-10',
  };

  return (
    <button
      className={`${getButtonClass(variant)} ${
        props.disabled ? 'opacity-50' : ''
      } ${
        icon
          ? `flex items-center justify-between ${
              !isLoader ? 'pl-1 py-0' : 'py-0'
            }`
          : ''
      } ${heightDict[size]}`}
      disabled={props.disabled}
      {...props}
    >
      {isLoader ? (
        <div className="flex items-center animate-spin-slow">
          <Icon
            scale={size === 'small' ? 0.6 : 0.8}
            name={'spin'}
            color={'currentColor'}
            fill={iconFill}
          />
        </div>
      ) : (
        <>
          {icon && (
            <div className="flex items-center pr-1">
              <Icon
                scale={size === 'small' ? 0.6 : 0.8}
                name={icon}
                color={'currentColor'}
                fill={iconFill}
              />
            </div>
          )}
          {!iconOnly && (
            <div className={`${sizeDict[size]} ${icon ? 'pr-4' : 'px-4'}`}>
              {title}
            </div>
          )}
        </>
      )}
    </button>
  );
};

const getButtonClass = (style: TButtonVariant) => {
  switch (style) {
    case 'primary':
      return 'bg-white-100 dark:bg-dark-200 hover:bg-white-300 dark:hover:bg-dark-300 py-1 m-1 border border-white-300 dark:border-dark-300 disabled:cursor-not-allowed rounded shadow transition ease-in-out font-sans font-normal text-dark-100 dark:text-white-200';
    case 'secondary':
      return 'bg-dark-200 dark:bg-white-100 hover:bg-dark-300 dark:hover:bg-white-300 py-1 m-1 border border-dark-300 dark:border-white-300 disabled:cursor-not-allowed rounded shadow transition ease-in-out font-sans font-normal text-white-200 dark:text-dark-100';
    case 'alert':
      return 'bg-red-500 hover:bg-red-400 py-1 m-1 border border-red-400 rounded shadow transition ease-in-out font-sans font-normal text-white-200';
    case 'success':
      return 'bg-green-600 hover:bg-green-500 py-1 m-1 border border-green-400 rounded shadow transition ease-in-out font-sans font-normal text-white-200';
    default:
      return 'bg-brand-200 hover:bg-brand-100 py-1 m-1 border border-brand-300 rounded shadow transition ease-in-out font-sans font-normal text-white-200';
  }
};
