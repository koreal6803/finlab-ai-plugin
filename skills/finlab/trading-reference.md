# Trading & Order Execution Reference

## Overview

This reference covers the complete workflow for executing trades from backtest results to live orders. The process involves:

1. **Position Calculation**: Convert backtest results to share quantities
2. **Broker Connection**: Configure and connect to your broker account
3. **Order Execution**: Create, update, and manage orders via OrderExecutor

---

## Position Class

The `Position` class represents target holdings and provides methods for converting backtest results to executable positions.

**Import:**
```python
from finlab.online.order_executor import Position
```

### Position.from_report()

Convert a backtest report to tradeable positions.

**Signature:**
```python
Position.from_report(
    report,
    fund: float,
    odd_lot: bool = False
) -> Position
```

**Parameters:**
- `report` (Report, required): Backtest report object from `sim()`
- `fund` (float, required): Total capital in TWD for position sizing
- `odd_lot` (bool, default=False): Enable odd lot (零股) trading for smaller positions

**Returns:**
- `Position`: List of position dictionaries with stock_id, quantity, and order_condition

**Example:**
```python
from finlab import backtest
from finlab.online.order_executor import Position

report = backtest.sim(position, resample="M")

# Standard lot trading
position = Position.from_report(report, fund=1000000)
print(position)
# [{'stock_id': '2330', 'quantity': 1, 'order_condition': <OrderCondition.CASH: 1>}]

# Odd lot trading (smaller positions)
position = Position.from_report(report, fund=1000000, odd_lot=True)
```

---

### Custom Position

Create a position manually without backtest.

**Signature:**
```python
Position(holdings: dict) -> Position
```

**Example:**
```python
# Simple position with share counts
position = Position({'2330': 1, '1101': 2})

# Fractional shares (for odd lot)
position = Position({'2330': 1, '1101': 1.001})
```

---

### Position Arithmetic

Combine or modify positions using arithmetic operations.

**Subtraction:**
```python
# Remove stocks from position
new_position = position - Position({'2330': 1})
```

**Addition:**
```python
# Add stocks to position
new_position = position + Position({'1101': 1})
```

**Multi-strategy combination:**
```python
# Combine positions from multiple strategies
position1 = Position.from_report(report1, fund=500000)
position2 = Position.from_report(report2, fund=500000)
total_position = position1 + position2
```

---

## Broker Account Setup

### Environment Variables Summary

| Broker | Required Environment Variables |
|--------|-------------------------------|
| Esun (玉山) | `ESUN_CONFIG_PATH`, `ESUN_MARKET_API_KEY`, `ESUN_ACCOUNT_PASSWORD`, `ESUN_CERT_PASSWORD` |
| Sinopac (永豐) | `SHIOAJI_API_KEY`, `SHIOAJI_SECRET_KEY`, `SHIOAJI_CERT_PERSON_ID`, `SHIOAJI_CERT_PATH`, `SHIOAJI_CERT_PASSWORD` |
| Masterlink (元富) | `MASTERLINK_NATIONAL_ID`, `MASTERLINK_ACCOUNT`, `MASTERLINK_ACCOUNT_PASS`, `MASTERLINK_CERT_PATH`, `MASTERLINK_CERT_PASS` |
| Fubon (富邦) | `FUBON_NATIONAL_ID`, `FUBON_ACCOUNT_PASS`, `FUBON_CERT_PATH` |

---

### Esun (玉山證券)

**Import:**
```python
from finlab.online.esun_account import EsunAccount
```

**Environment Variables:**
```bash
export ESUN_CONFIG_PATH='/path/to/config.ini'
export ESUN_MARKET_API_KEY='your_market_api_key'
export ESUN_ACCOUNT_PASSWORD='your_password'
export ESUN_CERT_PASSWORD='your_cert_password'
```

**Usage:**
```python
import os

os.environ['ESUN_CONFIG_PATH'] = '/path/to/config.ini'
os.environ['ESUN_MARKET_API_KEY'] = 'your_market_api_key'
os.environ['ESUN_ACCOUNT_PASSWORD'] = 'your_password'
os.environ['ESUN_CERT_PASSWORD'] = 'your_cert_password'

acc = EsunAccount()
```

**Install SDK:**
```bash
pip install esun-trade
```

---

### Sinopac (永豐證券)

**Import:**
```python
from finlab.online.sinopac_account import SinopacAccount
```

**Environment Variables:**
```bash
export SHIOAJI_API_KEY='api_key'
export SHIOAJI_SECRET_KEY='secret_key'
export SHIOAJI_CERT_PERSON_ID='A123456789'
export SHIOAJI_CERT_PATH='/path/to/cert'
export SHIOAJI_CERT_PASSWORD='cert_password'
```

**Usage:**
```python
import os

os.environ['SHIOAJI_API_KEY'] = 'api_key'
os.environ['SHIOAJI_SECRET_KEY'] = 'secret_key'
os.environ['SHIOAJI_CERT_PERSON_ID'] = 'A123456789'
os.environ['SHIOAJI_CERT_PATH'] = '/path/to/cert'
os.environ['SHIOAJI_CERT_PASSWORD'] = 'cert_password'

acc = SinopacAccount()
```

**Install SDK:**
```bash
pip install shioaji
```

---

### Masterlink (元富證券)

**Import:**
```python
from finlab.online.masterlink_account import MasterlinkAccount
```

**Environment Variables:**
```bash
export MASTERLINK_NATIONAL_ID='A123456789'
export MASTERLINK_ACCOUNT='account'
export MASTERLINK_ACCOUNT_PASS='password'
export MASTERLINK_CERT_PATH='/path/to/cert'
export MASTERLINK_CERT_PASS='cert_password'
```

**Usage:**
```python
import os

os.environ['MASTERLINK_NATIONAL_ID'] = 'A123456789'
os.environ['MASTERLINK_ACCOUNT'] = 'account'
os.environ['MASTERLINK_ACCOUNT_PASS'] = 'password'
os.environ['MASTERLINK_CERT_PATH'] = '/path/to/cert'
os.environ['MASTERLINK_CERT_PASS'] = 'cert_password'

acc = MasterlinkAccount()
```

---

### Fubon (富邦證券)

**Import:**
```python
from finlab.online.fubon_account import FubonAccount
```

**Environment Variables:**
```bash
export FUBON_NATIONAL_ID='A123456789'
export FUBON_ACCOUNT_PASS='password'
export FUBON_CERT_PATH='/path/to/cert.pfx'
```

**Usage:**
```python
import os

os.environ['FUBON_NATIONAL_ID'] = 'A123456789'
os.environ['FUBON_ACCOUNT_PASS'] = 'password'
os.environ['FUBON_CERT_PATH'] = '/path/to/cert.pfx'

acc = FubonAccount()
```

---

## OrderExecutor Class

The `OrderExecutor` manages order creation, modification, and cancellation.

**Import:**
```python
from finlab.online.order_executor import OrderExecutor
```

**Signature:**
```python
OrderExecutor(
    position: Position,
    account: BrokerAccount
) -> OrderExecutor
```

**Parameters:**
- `position` (Position, required): Target position to execute
- `account` (BrokerAccount, required): Connected broker account instance

**Example:**
```python
from finlab.online.order_executor import OrderExecutor, Position
from finlab.online.sinopac_account import SinopacAccount

# Setup
position = Position.from_report(report, fund=1000000)
acc = SinopacAccount()
executor = OrderExecutor(position, account=acc)
```

---

### OrderExecutor Methods

#### show_alerting_stocks()

Display stocks that require pre-deposit (處置股/警示股).

```python
executor.show_alerting_stocks()
```

---

#### create_orders()

Create orders based on the target position.

**Signature:**
```python
create_orders(view_only: bool = False) -> None
```

**Parameters:**
- `view_only` (bool, default=False): If True, preview orders without execution

**Example:**
```python
# Preview orders first (recommended)
executor.create_orders(view_only=True)

# Execute orders
executor.create_orders()
```

---

#### update_order_price()

Update limit price for pending orders.

```python
executor.update_order_price()
```

---

#### cancel_orders()

Cancel all pending orders.

```python
executor.cancel_orders()
```

---

## Check Account Position

Query current holdings from broker.

```python
# Get current holdings
print(acc.get_position())
```

---

## Related References

- [backtesting-reference.md](backtesting-reference.md): Backtest configuration and report generation
- [best-practices.md](best-practices.md): Coding patterns and anti-patterns
