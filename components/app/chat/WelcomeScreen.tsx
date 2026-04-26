import { Package, Search, Sparkles } from "lucide-react";

interface WelcomeScreenProps {
  onSuggestionClick: (message: { text: string }) => void;
  isSignedIn: boolean;
}

const productSuggestions = [
  "Show me Uganda Premier League jerseys",
  "KCCA FC home kit",
  "Vipers SC away jersey",
  "Football scarves and caps",
  "Match-day merchandise under UGX 100,000",
];

const orderSuggestions = [
  "Where is my jersey order?",
  "Show my recent merchandise orders",
  "Has my delivery been shipped?",
];

export function WelcomeScreen({
  onSuggestionClick,
  isSignedIn,
}: WelcomeScreenProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center px-4">
      <div className="rounded-full bg-primary/10 p-4">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>

      <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
        How can I help you today?
      </h3>

      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
        {isSignedIn
          ? "I can help you find Uganda league football merchandise, check your orders, and track deliveries."
          : "I can help you find Uganda league football merchandise — jerseys, kits, scarves, and more. Just ask!"}
      </p>

      {/* Product suggestions */}
      <div className="mt-6 w-full max-w-sm">
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
          <Search className="h-3 w-3" />
          Find merchandise
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {productSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSuggestionClick({ text: suggestion })}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:border-primary hover:bg-primary/5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-primary dark:hover:bg-primary/10"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Order suggestions */}
      {isSignedIn && (
        <div className="mt-4 w-full max-w-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
            <Package className="h-3 w-3" />
            Your orders
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {orderSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSuggestionClick({ text: suggestion })}
                className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm text-primary transition-colors hover:bg-primary/10"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
