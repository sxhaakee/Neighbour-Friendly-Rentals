# 🎨 Premium Components Usage Guide

## ✅ Components Created

### 1. PremiumButton
### 2. PremiumCard
### 3. PremiumBadge

---

## 📚 Usage Examples

### PremiumButton

```tsx
import { PremiumButton } from '@/components/ui';

// Primary button (gold gradient)
<PremiumButton variant="primary" size="md" onClick={handleClick}>
  Click Me
</PremiumButton>

// Secondary button (white with gold border)
<PremiumButton variant="secondary" size="lg">
  Learn More
</PremiumButton>

// Outline button
<PremiumButton variant="outline" size="sm">
  Cancel
</PremiumButton>

// Ghost button
<PremiumButton variant="ghost">
  Skip
</PremiumButton>

// Disabled button
<PremiumButton disabled>
  Processing...
</PremiumButton>

// Full width button
<PremiumButton fullWidth>
  Submit
</PremiumButton>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `disabled`: boolean
- `fullWidth`: boolean
- `onClick`: () => void
- `type`: 'button' | 'submit' | 'reset'

---

### PremiumCard

```tsx
import { PremiumCard } from '@/components/ui';

// Default card (white to amber gradient)
<PremiumCard>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</PremiumCard>

// Gold gradient card
<PremiumCard gradient="gold">
  <h3>Premium Content</h3>
</PremiumCard>

// White card
<PremiumCard gradient="white">
  <h3>Clean Look</h3>
</PremiumCard>

// Clickable card
<PremiumCard onClick={() => navigate('/item/123')}>
  <h3>Click me!</h3>
</PremiumCard>

// Non-hoverable card
<PremiumCard hoverable={false}>
  <h3>Static Card</h3>
</PremiumCard>
```

**Props:**
- `gradient`: 'default' | 'gold' | 'white'
- `hoverable`: boolean (default: true)
- `onClick`: () => void
- `className`: string

---

### PremiumBadge

```tsx
import { PremiumBadge } from '@/components/ui';

// Premium badge with crown icon
<PremiumBadge variant="premium" icon="crown">
  Premium
</PremiumBadge>

// Featured badge
<PremiumBadge variant="featured" icon="star">
  Featured
</PremiumBadge>

// Verified badge
<PremiumBadge variant="verified" icon="sparkles">
  Verified
</PremiumBadge>

// New badge
<PremiumBadge variant="new" icon="zap">
  New
</PremiumBadge>

// Hot badge
<PremiumBadge variant="hot">
  Hot Deal
</PremiumBadge>

// Without animation
<PremiumBadge animated={false}>
  Static
</PremiumBadge>

// Different sizes
<PremiumBadge size="sm">Small</PremiumBadge>
<PremiumBadge size="md">Medium</PremiumBadge>
<PremiumBadge size="lg">Large</PremiumBadge>
```

**Props:**
- `variant`: 'premium' | 'featured' | 'verified' | 'new' | 'hot'
- `size`: 'sm' | 'md' | 'lg'
- `icon`: 'crown' | 'sparkles' | 'star' | 'zap' | 'none'
- `animated`: boolean (default: true)
- `className`: string

---

## 🔄 Migration Examples

### Before & After

#### Buttons
```tsx
// ❌ Before
<button className="bg-primary text-white px-6 py-3 rounded-lg">
  Click Me
</button>

// ✅ After
<PremiumButton variant="primary">
  Click Me
</PremiumButton>
```

#### Cards
```tsx
// ❌ Before
<div className="bg-white rounded-lg shadow-md p-6">
  <h3>Title</h3>
  <p>Content</p>
</div>

// ✅ After
<PremiumCard>
  <h3>Title</h3>
  <p>Content</p>
</PremiumCard>
```

#### Badges
```tsx
// ❌ Before
<span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">
  Premium
</span>

// ✅ After
<PremiumBadge variant="premium" size="sm">
  Premium
</PremiumBadge>
```

---

## 🎨 Common Patterns

### Call-to-Action Section
```tsx
<PremiumCard gradient="gold" className="text-center">
  <h2 className="text-3xl font-bold mb-4">
    Upgrade to Premium
  </h2>
  <p className="text-gray-600 mb-6">
    Get unlimited listings and priority support
  </p>
  <PremiumButton variant="primary" size="lg">
    Upgrade Now
  </PremiumButton>
</PremiumCard>
```

### Product Card
```tsx
<PremiumCard onClick={() => navigate(`/item/${item.id}`)}>
  <div className="relative">
    <img src={item.image} alt={item.title} className="rounded-lg" />
    <div className="absolute top-2 right-2">
      <PremiumBadge variant="featured" size="sm">
        Featured
      </PremiumBadge>
    </div>
  </div>
  <h3 className="font-bold text-lg mt-4">{item.title}</h3>
  <p className="text-gray-600">{item.description}</p>
  <div className="flex justify-between items-center mt-4">
    <span className="text-2xl font-bold text-amber-600">
      ₹{item.price}
    </span>
    <PremiumButton variant="secondary" size="sm">
      View Details
    </PremiumButton>
  </div>
</PremiumCard>
```

### User Profile Header
```tsx
<PremiumCard gradient="gold">
  <div className="flex items-center gap-4">
    <img 
      src={user.avatar} 
      alt={user.name}
      className="w-20 h-20 rounded-full border-4 border-yellow-400"
    />
    <div>
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold">{user.name}</h2>
        {user.isPremium && (
          <PremiumBadge variant="premium" size="sm">
            Premium
          </PremiumBadge>
        )}
      </div>
      <p className="text-gray-600">{user.email}</p>
    </div>
  </div>
</PremiumCard>
```

---

## 🚀 Quick Replace Guide

Use these find/replace patterns to quickly update your code:

### Pattern 1: Simple Buttons
**Find:** `<button className="bg-primary`  
**Replace with:** `<PremiumButton variant="primary"`

### Pattern 2: Cards
**Find:** `<div className="bg-white rounded-lg shadow`  
**Replace with:** `<PremiumCard>`

### Pattern 3: Badges
**Find:** `<span className="bg-yellow-500 text-white`  
**Replace with:** `<PremiumBadge variant="premium"`

---

## ✨ Pro Tips

1. **Consistency**: Use the same variant across similar actions
2. **Hierarchy**: Primary for main actions, secondary for alternatives
3. **Spacing**: Premium components have built-in padding
4. **Animations**: All components animate automatically
5. **Accessibility**: All components support keyboard navigation

---

## 📦 Import Statement

```tsx
// Import all at once
import { PremiumButton, PremiumCard, PremiumBadge } from '@/components/ui';

// Or individually
import { PremiumButton } from '@/components/ui/PremiumButton';
```

---

**Now you can use these components throughout your entire project for a consistent premium look!** ✨
