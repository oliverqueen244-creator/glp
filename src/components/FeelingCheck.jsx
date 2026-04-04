export default function FeelingCheck({ onRespond }) {
  const responses = [
    { key: 'great', label: 'Great — no issues', color: '#7C8B6F', action: null },
    { key: 'mild', label: 'Mild nausea', color: '#C4956A', action: 'suggest-light' },
    { key: 'significant', label: 'Significant nausea', color: '#C47070', action: 'nausea-mode' },
    { key: 'severe', label: "Severe — can't eat", color: '#C47070', action: 'nausea-mode' },
  ];

  const messages = {
    great: null,
    mild: 'Noted. Lighter portions today. Stay hydrated.',
    significant: "This is normal after dose escalation. Switching to liquid meals. Your body is adapting.",
    severe: "Focus on hydration today. Sip ORS. If vomiting persists 24+ hours, call your doctor.",
  };

  return (
    <div className="fixed inset-0 bg-offwhite z-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm fade-in">
        <div className="text-center">
          <h1 className="font-serif text-2xl mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Post-Injection Check
          </h1>
          <p className="text-muted text-sm mb-8">
            How are you feeling this morning?
          </p>

          <div className="space-y-3">
            {responses.map(r => (
              <button
                key={r.key}
                onClick={() => onRespond(r.key, r.action, messages[r.key])}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-medium text-left transition-all duration-200"
                style={{
                  backgroundColor: r.color + '12',
                  color: r.color,
                  border: `1px solid ${r.color}30`,
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
