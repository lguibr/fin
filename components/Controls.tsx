import React, { useContext } from 'react';
import { ProjectionSettings } from '../types';
import Input from './ui/Input';
import Slider from './ui/Slider';
import { LanguageContext } from '../context/LanguageContext';
import { DollarSign, CalendarDays, TrendingUp, PieChart, Info } from 'lucide-react';

interface ControlsProps {
  settings: ProjectionSettings;
  setSettings: (settings: ProjectionSettings) => void;
}

const Controls: React.FC<ControlsProps> = ({ settings, setSettings }) => {
  const { t } = useContext(LanguageContext);
  const [balanceDisplayValue, setBalanceDisplayValue] = React.useState<string>(
    settings.initialBalance.toLocaleString('en-US')
  );

  // Sync display value when settings change externally
  React.useEffect(() => {
    setBalanceDisplayValue(settings.initialBalance.toLocaleString('en-US'));
  }, [settings.initialBalance]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: parseFloat(value) || 0 });
  };

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Remove all non-digit characters except decimal point
    const numericValue = rawValue.replace(/[^\d.]/g, '');
    
    // Update display value with formatting
    setBalanceDisplayValue(rawValue);
    
    // Parse and update actual value
    const parsedValue = parseFloat(numericValue) || 0;
    setSettings({ ...settings, initialBalance: parsedValue });
  };

  const handleBalanceBlur = () => {
    // Format on blur for clean display
    setBalanceDisplayValue(settings.initialBalance.toLocaleString('en-US'));
  };

  const handleBalanceFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Show raw number on focus for easier editing
    e.target.select();
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

  return (
    <div className="space-y-6">
      {/* Initial Balance */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          <label className="text-sm font-medium text-foreground">{t('initial_balance')}</label>
          <div className="group relative">
            <Info className="w-4 h-4 text-muted-foreground cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
              <div className="bg-popover text-popover-foreground text-xs rounded-md px-3 py-2 shadow-lg border border-border w-48">
                {t('tooltip_initial_balance')}
              </div>
            </div>
          </div>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
          <Input
            type="text"
            name="initialBalance"
            value={balanceDisplayValue}
            onChange={handleBalanceChange}
            onBlur={handleBalanceBlur}
            onFocus={handleBalanceFocus}
            className="text-lg font-semibold pl-7"
            placeholder="0"
          />
        </div>
      </div>

      {/* Projection Years */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary" />
          <div className="group relative flex items-center gap-1">
            <span className="text-sm font-medium text-foreground">{t('projection_years', { years: settings.projectionYears })}</span>
            <Info className="w-4 h-4 text-muted-foreground cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
              <div className="bg-popover text-popover-foreground text-xs rounded-md px-3 py-2 shadow-lg border border-border w-48">
                {t('tooltip_projection_years')}
              </div>
            </div>
          </div>
        </div>
        <Slider
          name="projectionYears"
          min={1}
          max={50}
          value={settings.projectionYears}
          onChange={handleChange}
          valueFormatter={(val) => `${val} years`}
        />
      </div>

      {/* Monthly Return Rate */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <div className="group relative flex items-center gap-1">
            <span className="text-sm font-medium text-foreground">{t('monthly_return_rate', { rate: settings.monthlyReturnRate })}</span>
            <Info className="w-4 h-4 text-muted-foreground cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
              <div className="bg-popover text-popover-foreground text-xs rounded-md px-3 py-2 shadow-lg border border-border w-48">
                {t('tooltip_monthly_return')}
              </div>
            </div>
          </div>
        </div>
        <Slider
          name="monthlyReturnRate"
          min={0}
          max={2}
          step={0.1}
          value={settings.monthlyReturnRate}
          onChange={handleChange}
          valueFormatter={(val) => `${val}%`}
        />
      </div>

      {/* Investment Allocation */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-primary" />
          <div className="group relative flex items-center gap-1">
            <span className="text-sm font-medium text-foreground">{t('surplus_to_invest', { percentage: settings.investmentAllocation })}</span>
            <Info className="w-4 h-4 text-muted-foreground cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
              <div className="bg-popover text-popover-foreground text-xs rounded-md px-3 py-2 shadow-lg border border-border w-48">
                {t('tooltip_investment_allocation')}
              </div>
            </div>
          </div>
        </div>
        <Slider
          name="investmentAllocation"
          min={0}
          max={100}
          value={settings.investmentAllocation}
          onChange={handleChange}
          valueFormatter={(val) => `${val}%`}
        />
      </div>
    </div>
  );
};

export default Controls;