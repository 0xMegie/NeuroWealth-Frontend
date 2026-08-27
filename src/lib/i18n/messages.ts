export type AppLocale = "en" | "fr";

export interface LandingFeatureItem {
  icon: string;
  title: string;
  desc: string;
  accent: string;
  bg: string;
}

export interface HowItWorksItem {
  n: string;
  title: string;
  desc: string;
}

export interface StrategyItem {
  name: string;
  apy: string;
  risk: string;
  desc: string;
  accentText: string;
  border: string;
  btnVariant: "primary" | "secondary";
  featured?: boolean;
}

export interface SecurityFeatureItem {
  title: string;
  stat: string;
  statLabel: string;
  desc: string;
}

export interface AppMessages {
  locale: {
    label: string;
    switcherLabel: string;
    options: Record<AppLocale, string>;
  };
  common: {
    comingSoon: string;
    loading: string;
    retry: string;
    save: string;
    cancel: string;
    edit: string;
    open: string;
  };
  navbar: {
    features: string;
    howItWorks: string;
    strategies: string;
    help: string;
    account: string;
    signOut: string;
    signIn: string;
  };
  hero: {
    badge: string;
    titleBeforeAccent: string;
    titleAccent: string;
    titleAfterAccent: string;
    description: string;
    stats: Array<{ label: string; value: string }>;
  };
  heroActions: {
    openDashboardArrow: string;
    connectWallet: string;
    connecting: string;
    openDashboard: string;
    learnMore: string;
    errorNoWallet: string;
    errorFailedConnect: string;
  };
  features: {
    badge: string;
    title: string;
    description: string;
    items: LandingFeatureItem[];
  };
  howItWorks: {
    badge: string;
    title: string;
    description: string;
    steps: HowItWorksItem[];
  };
  strategies: {
    badge: string;
    title: string;
    description: string;
    mostPopular: string;
    apyRiskLabel: string;
    selectPrefix: string;
    items: StrategyItem[];
  };
  security: {
    badge: string;
    title: string;
    description: string;
    items: SecurityFeatureItem[];
  };
  cta: {
    badge: string;
    title: string;
    description: string;
    connectWallet: string;
    openDashboard: string;
    trust: string[];
  };
  footer: {
    builtOn: string;
    designTokens: string;
  };
  formatters: {
    updatedPrefix: string;
  };
  dashboard: {
    realtime: {
      noEvents: string;
      simulatedStream: string;
      firesEvery: string;
      start: string;
      stop: string;
      reset: string;
      eventsFired: string;
      deltaBalance: string;
      deltaYield: string;
      deltaApy: string;
      eventLog: string;
      status: {
        live: string;
        paused: string;
        idle: string;
      };
    };
    portfolio: {
      overview: string;
      overviewDesc: string;
      themePreview: string;
      lightMode: string;
      darkMode: string;
      scenarioPreview: string;
      liveWidgets: string;
      emptyStates: string;
      loadingWidget: string;
      syncingData: string;
      source: string;
      sandbox: string;
      theme: string;
      unavailableTitle: string;
      unavailableDesc: string;
      retryWidgets: string;
      allocationTitle: string;
      allocationDesc: string;
      lines: string;
      line: string;
      emptyAllocation: string;
      loadSample: string;
      activityTitle: string;
      activityDesc: string;
      events: string;
      event: string;
      emptyActivity: string;
      noAmount: string;
    };
  };
  settings: {
    index: {
      title: string;
      subtitle: string;
      appearance: {
        title: string;
        themeTitle: string;
        themeDesc: string;
      };
      profile: {
        title: string;
        displayTitle: string;
        displayDesc: string;
        editAction: string;
        regionTitle: string;
        regionDesc: string;
        openAction: string;
      };
      wallet: {
        title: string;
        connectedTitle: string;
        connectedDesc: string;
        networkTitle: string;
        networkDesc: string;
      };
      notifications: {
        title: string;
        emailTitle: string;
        emailDesc: string;
        whatsappTitle: string;
        whatsappDesc: string;
      };
      security: {
        title: string;
        twoFactorTitle: string;
        twoFactorDesc: string;
        sessionTitle: string;
        sessionDesc: string;
      };
      region: {
        title: string;
        currencyTitle: string;
        currencyDesc: string;
        openAction: string;
      };
    };
    preferences: {
      title: string;
      subtitle: string;
      savedSuccess: string;
      saveError: string;
      localisation: {
        title: string;
        desc: string;
        localeLabel: string;
      };
      appearance: {
        title: string;
        desc: string;
        themeLabel: string;
        light: string;
        dark: string;
        system: string;
      };
      timeCurrency: {
        title: string;
        desc: string;
        timezoneLabel: string;
        currencyLabel: string;
      };
      actions: {
        edit: string;
        unsaved: string;
        cancel: string;
        save: string;
        saving: string;
      };
    };
    notifications: {
      title: string;
      subtitle: string;
      channels: {
        title: string;
        desc: string;
        emailTitle: string;
        emailDesc: string;
        transactionTitle: string;
        transactionDesc: string;
        weeklyTitle: string;
        weeklyDesc: string;
        productTitle: string;
        productDesc: string;
        securityTitle: string;
        securityDesc: string;
      };
      summary: {
        title: string;
        desc: string;
        enabledPreferences: string;
        emailChannel: string;
        active: string;
        muted: string;
        securityCoverage: string;
        protected: string;
        atRisk: string;
      };
      saveBehavior: {
        title: string;
        desc: string;
      };
      securityAlertsOff: {
        title: string;
        desc: string;
      };
      actions: {
        edit: string;
        unsaved: string;
        noPending: string;
        cancel: string;
        save: string;
        saving: string;
        restoreAlerts: string;
      };
      toast: {
        savedTitle: string;
        savedDesc: string;
        failTitle: string;
        failDesc: string;
      };
      banner: {
        savedTitle: string;
        failTitle: string;
        failDesc: string;
      };
    };
    security: {
      title: string;
      subtitle: string;
      banner: {
        success: string;
        error: string;
      };
      password: {
        title: string;
        desc: string;
        lastChangedLabel: string;
        daysAgoSuffix: string;
        warning: string;
        changeAction: string;
      };
      twoFactor: {
        title: string;
        desc: string;
        enableLabel: string;
        enabledHint: string;
        disabledHint: string;
      };
      loginAlerts: {
        title: string;
        desc: string;
        enableLabel: string;
        enabledHint: string;
        disabledHint: string;
      };
      actions: {
        edit: string;
        unsaved: string;
        cancel: string;
        save: string;
        saving: string;
      };
      modal: {
        title: string;
        closeLabel: string;
        newPasswordLabel: string;
        newPasswordPlaceholder: string;
        cancel: string;
        updating: string;
        update: string;
      };
    };
    privacy: {
      title: string;
      subtitle: string;
      cookieSection: {
        title: string;
        desc: string;
      };
    };
    strategies: {
      eyebrow: string;
      title: string;
      description: string;
      backToPortfolio: string;
      currentBadge: string;
      activeStrategyButton: string;
      comparison: {
        title: string;
        featureHeader: string;
        activeBadge: string;
        apyRangeLabel: string;
        riskLevelLabel: string;
      };
      success: {
        updated: string;
      };
      confirmModal: {
        title: string;
        switchingFrom: string;
        settingTo: string;
        note: string;
        cancel: string;
        confirm: string;
        saving: string;
        closeLabel: string;
      };
      cards: {
        conservative: { title: string; riskLabel: string; description: string; primaryAction: string };
        balanced: { title: string; riskLabel: string; description: string; primaryAction: string };
        growth: { title: string; riskLabel: string; description: string; primaryAction: string };
      };
    };
    onboarding: {
      title: string;
      subtitle: string;
      statusLabel: string;
      statusCompleted: string;
      statusInProgress: string;
      lastStepLabel: string;
      lastStepValue: string;
      completedLabel: string;
      actionsTitle: string;
      reviewAction: string;
      resetAction: string;
      resetting: string;
      confirmReset: string;
      toastFailTitle: string;
      toastFailDesc: string;
      helpReviewLabel: string;
      helpReviewDesc: string;
      helpResetLabel: string;
      helpResetDesc: string;
    };
    themeSelector: {
      ariaLabel: string;
    };
  };
}

export const localeToIntl: Record<AppLocale, string> = {
  en: "en-US",
  fr: "fr-FR",
};

export const dictionaries: Record<AppLocale, AppMessages> = {
  en: {
    locale: {
      label: "Language",
      switcherLabel: "Switch language",
      options: {
        en: "English",
        fr: "Français",
      },
    },
    common: {
      comingSoon: "Coming soon",
      loading: "Loading...",
      retry: "Retry",
      save: "Save",
      cancel: "Cancel",
      edit: "Edit",
      open: "Open",
    },
    navbar: {
      features: "Features",
      howItWorks: "How it works",
      strategies: "Strategies",
      help: "Help",
      account: "Account",
      signOut: "Sign Out",
      signIn: "Sign in",
    },
    hero: {
      badge: "Powered by Stellar · Built with AI",
      titleBeforeAccent: "Your money, working",
      titleAccent: "24/7",
      titleAfterAccent: "on autopilot",
      description:
        "NeuroWealth is an autonomous AI agent that finds and deploys your USDC into the highest-yielding opportunities on Stellar DeFi — automatically, every hour.",
      stats: [
        { label: "Avg. APY", value: "8.4%" },
        { label: "Finality", value: "~5s" },
        { label: "Tx Fee", value: "<$0.01" },
      ],
    },
    heroActions: {
      openDashboardArrow: "Open Dashboard →",
      connectWallet: "Connect Wallet",
      connecting: "Connecting...",
      openDashboard: "Open Dashboard",
      learnMore: "Learn More ↓",
      errorNoWallet: "Freighter wallet not found. Please install it.",
      errorFailedConnect: "Failed to connect. Please try again.",
    },
    features: {
      badge: "Features",
      title: "Everything you need",
      description: "Simple on the surface, powerful underneath.",
      items: [
        {
          icon: "🤖",
          title: "AI Agent",
          desc: "Autonomous 24/7 yield optimization across Stellar DeFi protocols.",
          accent: "text-sky-400",
          bg: "bg-sky-500/10",
        },
        {
          icon: "💬",
          title: "Natural Language",
          desc: "Chat to deposit, withdraw, and check balances — no DeFi knowledge needed.",
          accent: "text-emerald-400",
          bg: "bg-emerald-500/10",
        },
        {
          icon: "📈",
          title: "Auto-Rebalancing",
          desc: "The agent shifts funds to the best opportunities automatically, hourly.",
          accent: "text-sky-400",
          bg: "bg-sky-500/10",
        },
        {
          icon: "🔐",
          title: "Non-Custodial",
          desc: "Your funds live in audited Soroban smart contracts. Always yours.",
          accent: "text-emerald-400",
          bg: "bg-emerald-500/10",
        },
        {
          icon: "⚡",
          title: "Instant Withdrawals",
          desc: "No lock-ups, no penalties. Withdraw anytime in seconds.",
          accent: "text-amber-400",
          bg: "bg-amber-500/10",
        },
        {
          icon: "🌍",
          title: "Global Access",
          desc: "No geographic restrictions, no bank account required.",
          accent: "text-sky-400",
          bg: "bg-sky-500/10",
        },
      ],
    },
    howItWorks: {
      badge: "How it works",
      title: "Four steps to passive yield",
      description: "Get started in minutes, earn around the clock.",
      steps: [
        {
          n: "01",
          title: "Deposit USDC",
          desc: "Connect your Freighter wallet and deposit USDC into the NeuroWealth vault.",
        },
        {
          n: "02",
          title: "AI Deploys Funds",
          desc: "The agent detects your deposit and immediately deploys to the best protocol.",
        },
        {
          n: "03",
          title: "Yield Accumulates",
          desc: "Earnings compound 24/7. The agent rebalances hourly if better rates appear.",
        },
        {
          n: "04",
          title: "Withdraw Anytime",
          desc: "Request a withdrawal — funds arrive in your wallet within seconds.",
        },
      ],
    },
    strategies: {
      badge: "Strategies",
      title: "Choose your strategy",
      description: "Pick your risk appetite. The AI handles the rest.",
      mostPopular: "Most popular",
      apyRiskLabel: "APY · {{risk}} risk",
      selectPrefix: "Select",
      items: [
        {
          name: "Conservative",
          apy: "4–6%",
          risk: "Low",
          desc: "Stablecoin lending on Blend. Steady, predictable returns with minimal exposure.",
          accentText: "text-sky-400",
          border: "border-sky-500/20",
          btnVariant: "secondary",
        },
        {
          name: "Balanced",
          apy: "7–10%",
          risk: "Medium",
          desc: "Mix of lending and DEX liquidity provision for better yield without excessive risk.",
          accentText: "text-emerald-400",
          border: "border-emerald-500/30",
          btnVariant: "primary",
          featured: true,
        },
        {
          name: "Growth",
          apy: "11–18%",
          risk: "High",
          desc: "Aggressive multi-protocol deployment for maximum returns.",
          accentText: "text-amber-400",
          border: "border-amber-500/20",
          btnVariant: "secondary",
        },
      ],
    },
    security: {
      badge: "Security",
      title: "Built to be trusted",
      description: "Security is not an afterthought — it is the foundation.",
      items: [
        {
          title: "Non-Custodial",
          stat: "100%",
          statLabel: "Your keys, your coins",
          desc: "Your USDC stays in audited Soroban smart contracts that only you can authorize. We never hold or access your private keys.",
        },
        {
          title: "Audited Contracts",
          stat: "0",
          statLabel: "Security incidents",
          desc: "All smart contracts undergo rigorous third-party security audits before mainnet deployment. Source code is publicly verifiable on-chain.",
        },
        {
          title: "Open Source",
          stat: "100%",
          statLabel: "Transparent code",
          desc: "Every line of code is open source and community-reviewed. No black boxes — verify exactly what the protocol does with your funds.",
        },
        {
          title: "Stellar Network",
          stat: "10+",
          statLabel: "Years of proven uptime",
          desc: "Built on Stellar's battle-tested blockchain with a decade of proven reliability, instant finality (~5s), and sub-cent transaction fees.",
        },
      ],
    },
    cta: {
      badge: "Get started today",
      title: "Ready to put your USDC to work?",
      description:
        "Join thousands earning passive yield on Stellar DeFi. Connect your Freighter wallet and let NeuroWealth handle the rest.",
      connectWallet: "Connect Wallet",
      openDashboard: "Open Dashboard",
      trust: [
        "✔ Non-custodial",
        "✔ Audited contracts",
        "✔ No lock-ups",
        "✔ Open source",
      ],
    },
    footer: {
      builtOn: "Built on Stellar",
      designTokens: "Design Tokens",
    },
    formatters: {
      updatedPrefix: "Updated",
    },
    dashboard: {
      realtime: {
        noEvents: "No events yet — start the stream to see live updates.",
        simulatedStream: "Simulated event stream",
        firesEvery: "Fires deposits, withdrawals, and rebalances every 4–9 s",
        start: "Start",
        stop: "Stop",
        reset: "Reset",
        eventsFired: "Events fired",
        deltaBalance: "Δ Balance",
        deltaYield: "Δ Yield",
        deltaApy: "Δ APY",
        eventLog: "Event log",
        status: {
          live: "Live",
          paused: "Paused",
          idle: "Idle",
        },
      },
      portfolio: {
        overview: "NeuroWealth overview",
        overviewDesc: "Total balance, yield, APY, strategy, allocation, and recent activity in a single review surface with measurable light and dark theme parity.",
        themePreview: "Theme preview",
        lightMode: "Light mode",
        darkMode: "Dark mode",
        scenarioPreview: "Scenario preview",
        liveWidgets: "Live widgets",
        emptyStates: "Empty states",
        loadingWidget: "Loading portfolio widget state...",
        syncingData: "Syncing portfolio data",
        source: "Source",
        sandbox: "Sandbox",
        theme: "Theme",
        unavailableTitle: "Portfolio widgets unavailable",
        unavailableDesc: "The dashboard can retry once connectivity to the portfolio API is restored.",
        retryWidgets: "Retry widgets",
        allocationTitle: "Asset allocation",
        allocationDesc: "Visible deployment mix across strategy buckets and reserve capital.",
        lines: "allocation lines",
        line: "allocation line",
        emptyAllocation: "No allocation yet. Add a deposit to see deployed positions and reserve coverage.",
        loadSample: "Load sample data",
        activityTitle: "Recent activity",
        activityDesc: "Latest deposits, yield events, rebalances, and scheduled cash flows.",
        events: "events",
        event: "event",
        emptyActivity: "No recent activity yet. Deposits and rebalances will appear here as soon as they happen.",
        noAmount: "No amount",
      },
    },
    settings: {
      index: {
        title: "Settings",
        subtitle: "Manage your account preferences and connected wallet.",
        appearance: {
          title: "Appearance",
          themeTitle: "Theme",
          themeDesc: "Choose between light, dark, or system preference.",
        },
        profile: {
          title: "Profile",
          displayTitle: "Display Name & Preferences",
          displayDesc: "Edit your display name, locale, timezone, and currency format.",
          editAction: "Edit profile",
          regionTitle: "Language & Region",
          regionDesc: "Change your locale and regional display settings.",
          openAction: "Open",
        },
        wallet: {
          title: "Wallet",
          connectedTitle: "Connected Wallet",
          connectedDesc: "Freighter wallet connection for signing transactions.",
          networkTitle: "Network",
          networkDesc: "Switch between Stellar Testnet and Mainnet.",
        },
        notifications: {
          title: "Notifications",
          emailTitle: "Email Alerts",
          emailDesc: "Receive email notifications for deposits, withdrawals, and rebalances.",
          whatsappTitle: "WhatsApp Notifications",
          whatsappDesc: "Get updates via WhatsApp messaging.",
        },
        security: {
          title: "Security",
          twoFactorTitle: "Two-Factor Authentication",
          twoFactorDesc: "Add an extra layer of security to your account.",
          sessionTitle: "Session Management",
          sessionDesc: "View and revoke active sessions.",
        },
        region: {
          title: "Region",
          currencyTitle: "Currency Display",
          currencyDesc: "Choose your preferred display currency (USD, EUR, GBP).",
          openAction: "Open profile",
        },
      },
      preferences: {
        title: "Preferences",
        subtitle: "Manage language, timezone, and currency settings",
        savedSuccess: "Preferences saved successfully",
        saveError: "Failed to save preferences. Please try again.",
        localisation: {
          title: "Localisation",
          desc: "Language and regional display preferences",
          localeLabel: "Locale",
        },
        appearance: {
          title: "Appearance",
          desc: "Theme and visual display preferences",
          themeLabel: "Theme",
          light: "Light",
          dark: "Dark",
          system: "System",
        },
        timeCurrency: {
          title: "Time & Currency",
          desc: "Timezone and numeric format settings",
          timezoneLabel: "Timezone",
          currencyLabel: "Currency Format",
        },
        actions: {
          edit: "Edit Preferences",
          unsaved: "Unsaved changes",
          cancel: "Cancel",
          save: "Save Changes",
          saving: "Saving…",
        },
      },
      notifications: {
        title: "Notifications",
        subtitle: "Manage the alerts we send across email, account activity, and security events.",
        channels: {
          title: "Delivery channels",
          desc: "Choose which updates reach inboxes, dashboards, and weekly summaries.",
          emailTitle: "Email notifications",
          emailDesc: "Receive delivery updates and account notices in your inbox.",
          transactionTitle: "Transaction alerts",
          transactionDesc: "Send a notification whenever a deposit, withdrawal, or rebalance completes.",
          weeklyTitle: "Weekly digest",
          weeklyDesc: "Bundle performance summaries and highlights into a single weekly update.",
          productTitle: "Product updates",
          productDesc: "Hear about launches, experiments, and platform improvements.",
          securityTitle: "Security alerts",
          securityDesc: "Critical sign-in, wallet, and suspicious-activity notifications.",
        },
        summary: {
          title: "Current summary",
          desc: "Track enabled signals before publishing changes.",
          enabledPreferences: "Enabled preferences",
          emailChannel: "Email channel",
          active: "Active",
          muted: "Muted",
          securityCoverage: "Security coverage",
          protected: "Protected",
          atRisk: "At risk",
        },
        saveBehavior: {
          title: "Save behavior",
          desc: "Successful saves emit a success banner and toast. Disabling security alerts simulates a blocked save.",
        },
        securityAlertsOff: {
          title: "Security alerts are turned off",
          desc: "High-risk account events may be missed until you re-enable security coverage.",
        },
        actions: {
          edit: "Edit Preferences",
          unsaved: "Unsaved changes",
          noPending: "No pending changes",
          cancel: "Cancel",
          save: "Save Changes",
          saving: "Saving...",
          restoreAlerts: "Restore security alerts",
        },
        toast: {
          savedTitle: "Preferences saved",
          savedDesc: "Your notification rules were updated for future account activity.",
          failTitle: "Save failed",
          failDesc: "Security alerts are required in this mocked flow. Re-enable them and try again.",
        },
        banner: {
          savedTitle: "Notification preferences saved",
          failTitle: "Unable to save your current selection",
          failDesc: "This mocked failure path intentionally blocks saving while security alerts are disabled.",
        },
      },
      security: {
        title: "Security",
        subtitle: "Manage your password, two-factor authentication, and login alerts.",
        banner: {
          success: "Security settings updated successfully",
          error: "Failed to update security settings. Please try again.",
        },
        password: {
          title: "Password",
          desc: "Keep your account secure with a strong, regularly updated password.",
          lastChangedLabel: "Last changed",
          daysAgoSuffix: "days ago",
          warning: "Your password is over 90 days old. Consider updating it.",
          changeAction: "Change password",
        },
        twoFactor: {
          title: "Two-Factor Authentication",
          desc: "Add an extra layer of security to your account.",
          enableLabel: "Enable two-factor authentication",
          enabledHint: "Two-factor authentication is protecting your account.",
          disabledHint: "Enable two-factor authentication for stronger protection.",
        },
        loginAlerts: {
          title: "Login Alerts",
          desc: "Get notified whenever a new device signs in to your account.",
          enableLabel: "Enable login alerts",
          enabledHint: "You'll be notified of new sign-ins.",
          disabledHint: "You won't be notified of new sign-ins.",
        },
        actions: {
          edit: "Edit Security Settings",
          unsaved: "Unsaved changes",
          cancel: "Cancel",
          save: "Save Changes",
          saving: "Saving…",
        },
        modal: {
          title: "Change password",
          closeLabel: "Close",
          newPasswordLabel: "New password",
          newPasswordPlaceholder: "Enter new password",
          cancel: "Cancel",
          updating: "Updating…",
          update: "Update password",
        },
      },
      privacy: {
        title: "Privacy",
        subtitle: "Control how NeuroWealth uses cookies and data on your device.",
        cookieSection: {
          title: "Cookie & Privacy Preferences",
          desc: "Review your current consent status and adjust which cookie categories are active.",
        },
      },
      strategies: {
        eyebrow: "Settings",
        title: "Choose your strategy",
        description: "Select the risk/APY profile that matches your goals. Your active positions will rebalance on the next scheduled cycle.",
        backToPortfolio: "Back to portfolio",
        currentBadge: "Current",
        activeStrategyButton: "Active strategy",
        comparison: {
          title: "Strategy comparison",
          featureHeader: "Feature",
          activeBadge: "active",
          apyRangeLabel: "APY range",
          riskLevelLabel: "Risk level",
        },
        success: {
          updated: "Strategy updated to {{strategy}}. Rebalancing will apply on the next scheduled cycle.",
        },
        confirmModal: {
          title: "Confirm strategy change",
          switchingFrom: "Switching from {{from}} to {{to}}.",
          settingTo: "Setting your strategy to {{to}}.",
          note: "Active positions will be rebalanced on the next scheduled cycle. This change does not trigger an immediate on-chain transaction.",
          cancel: "Cancel",
          confirm: "Confirm change",
          saving: "Saving…",
          closeLabel: "Cancel",
        },
        cards: {
          conservative: {
            title: "Conservative",
            riskLabel: "Low risk",
            description: "Stablecoin lending and idle reserve coverage. Capital-preserving with predictable yield and minimal drawdown exposure.",
            primaryAction: "Select Conservative",
          },
          balanced: {
            title: "Balanced",
            riskLabel: "Medium risk",
            description: "Yield split across Blend lending, DEX liquidity, and a stable reserve. Best for steady growth with controlled volatility.",
            primaryAction: "Select Balanced",
          },
          growth: {
            title: "Growth",
            riskLabel: "High risk",
            description: "Leans into incentive programs, active rebalancing, and higher-volatility positions. Maximum upside with elevated risk.",
            primaryAction: "Select Growth",
          },
        },
      },
      onboarding: {
        title: "Onboarding Settings",
        subtitle: "Manage your onboarding progress and review setup steps.",
        statusLabel: "Status",
        statusCompleted: "Completed",
        statusInProgress: "In Progress",
        lastStepLabel: "Last Step:",
        lastStepValue: "Step {{step}}",
        completedLabel: "Completed:",
        actionsTitle: "Actions",
        reviewAction: "Review Onboarding",
        resetAction: "Reset Onboarding",
        resetting: "Resetting...",
        confirmReset: "Are you sure you want to reset the onboarding process? This will allow you to go through the setup again.",
        toastFailTitle: "Failed to reset onboarding",
        toastFailDesc: "Please try again.",
        helpReviewLabel: "Review Onboarding:",
        helpReviewDesc: "Go through the setup steps again without changing your current settings.",
        helpResetLabel: "Reset Onboarding:",
        helpResetDesc: "Clear all onboarding progress and start fresh from the beginning.",
      },
      themeSelector: {
        ariaLabel: "Theme selection",
      },
    },
  },
  fr: {
    locale: {
      label: "Langue",
      switcherLabel: "Changer de langue",
      options: {
        en: "Anglais",
        fr: "Français",
      },
    },
    common: {
      comingSoon: "Bientôt disponible",
      loading: "Chargement...",
      retry: "Réessayer",
      save: "Enregistrer",
      cancel: "Annuler",
      edit: "Modifier",
      open: "Ouvrir",
    },
    navbar: {
      features: "Fonctionnalités",
      howItWorks: "Comment ça marche",
      strategies: "Stratégies",
      help: "Aide",
      account: "Compte",
      signOut: "Se déconnecter",
      signIn: "Se connecter",
    },
    hero: {
      badge: "Propulsé par Stellar · Construit avec l’IA",
      titleBeforeAccent: "Votre argent travaille",
      titleAccent: "24h/24",
      titleAfterAccent: "en pilote automatique",
      description:
        "NeuroWealth est un agent IA autonome qui place votre USDC dans les meilleures opportunités de rendement de l’écosystème DeFi Stellar — automatiquement, avec optimisation horaire.",
      stats: [
        { label: "APY moy.", value: "8,4 %" },
        { label: "Finalité", value: "~5 s" },
        { label: "Frais tx", value: "<0,01 $" },
      ],
    },
    heroActions: {
      openDashboardArrow: "Ouvrir le tableau de bord →",
      connectWallet: "Connecter le wallet",
      connecting: "Connexion en cours...",
      openDashboard: "Ouvrir le tableau de bord",
      learnMore: "En savoir plus ↓",
      errorNoWallet:
        "Wallet Freighter introuvable. Veuillez l’installer.",
      errorFailedConnect:
        "Échec de la connexion. Veuillez réessayer.",
    },
    features: {
      badge: "Fonctionnalités",
      title: "Tout ce dont vous avez besoin",
      description: "Simple en surface, puissant en profondeur.",
      items: [
        {
          icon: "🤖",
          title: "Agent IA autonome",
          desc: "Optimisation du rendement 24h/24 et 7j/7 sur plusieurs protocoles DeFi Stellar.",
          accent: "text-sky-400",
          bg: "bg-sky-500/10",
        },
        {
          icon: "💬",
          title: "Langage naturel",
          desc: "Déposer, retirer et vérifier vos soldes par chat — sans expertise DeFi.",
          accent: "text-emerald-400",
          bg: "bg-emerald-500/10",
        },
        {
          icon: "📈",
          title: "Rééquilibrage automatique",
          desc: "L’agent réalloue vos fonds automatiquement vers les meilleures opportunités.",
          accent: "text-sky-400",
          bg: "bg-sky-500/10",
        },
        {
          icon: "🔐",
          title: "Non-custodial",
          desc: "Vos fonds restent dans des smart contracts Soroban audités. Vous gardez le contrôle.",
          accent: "text-emerald-400",
          bg: "bg-emerald-500/10",
        },
        {
          icon: "⚡",
          title: "Retraits instantanés",
          desc: "Aucun blocage, aucune pénalité. Retirez vos fonds à tout moment en quelques secondes.",
          accent: "text-amber-400",
          bg: "bg-amber-500/10",
        },
        {
          icon: "🌍",
          title: "Accès global",
          desc: "Sans restriction géographique et sans compte bancaire traditionnel.",
          accent: "text-sky-400",
          bg: "bg-sky-500/10",
        },
      ],
    },
    howItWorks: {
      badge: "Comment ça marche",
      title: "Quatre étapes vers le rendement passif",
      description: "Commencez en quelques minutes, gagnez en continu.",
      steps: [
        {
          n: "01",
          title: "Déposer des USDC",
          desc: "Connectez votre wallet Freighter et déposez des USDC dans le vault NeuroWealth.",
        },
        {
          n: "02",
          title: "L’IA déploie les fonds",
          desc: "L’agent détecte votre dépôt et l’alloue immédiatement au meilleur protocole.",
        },
        {
          n: "03",
          title: "Les rendements s’accumulent",
          desc: "Les gains se composent 24h/24. L’agent rééquilibre dès qu’un meilleur taux apparaît.",
        },
        {
          n: "04",
          title: "Retirer à tout moment",
          desc: "Demandez un retrait — les fonds arrivent dans votre wallet en quelques secondes.",
        },
      ],
    },
    strategies: {
      badge: "Stratégies",
      title: "Choisissez votre stratégie",
      description: "Définissez votre niveau de risque. L’IA gère le reste.",
      mostPopular: "La plus populaire",
      apyRiskLabel: "APY · risque {{risk}}",
      selectPrefix: "Choisir",
      items: [
        {
          name: "Prudente",
          apy: "4–6 %",
          risk: "faible",
          desc: "Prêts en stablecoins sur Blend pour des rendements stables et prévisibles.",
          accentText: "text-sky-400",
          border: "border-sky-500/20",
          btnVariant: "secondary",
        },
        {
          name: "Équilibrée",
          apy: "7–10 %",
          risk: "moyen",
          desc: "Combinaison de lending et de liquidité DEX pour un bon équilibre risque/rendement.",
          accentText: "text-emerald-400",
          border: "border-emerald-500/30",
          btnVariant: "primary",
          featured: true,
        },
        {
          name: "Croissance",
          apy: "11–18 %",
          risk: "élevé",
          desc: "Allocation agressive multi-protocole pour maximiser le potentiel de rendement.",
          accentText: "text-amber-400",
          border: "border-amber-500/20",
          btnVariant: "secondary",
        },
      ],
    },
    security: {
      badge: "Sécurité",
      title: "Conçu pour inspirer confiance",
      description: "La sécurité n’est pas une option — c’est la base.",
      items: [
        {
          title: "Non-custodial",
          stat: "100 %",
          statLabel: "Vos clés, vos fonds",
          desc: "Vos USDC restent dans des smart contracts Soroban audités que vous seul pouvez autoriser.",
        },
        {
          title: "Contrats audités",
          stat: "0",
          statLabel: "incident de sécurité",
          desc: "Tous les smart contracts passent des audits de sécurité tiers avant déploiement mainnet.",
        },
        {
          title: "Open Source",
          stat: "100 %",
          statLabel: "code transparent",
          desc: "Chaque ligne de code est ouverte et vérifiable par la communauté — sans boîte noire.",
        },
        {
          title: "Réseau Stellar",
          stat: "10+",
          statLabel: "ans de disponibilité prouvée",
          desc: "Basé sur la blockchain Stellar, avec finalité rapide et frais de transaction très faibles.",
        },
      ],
    },
    cta: {
      badge: "Commencez dès aujourd’hui",
      title: "Prêt à faire travailler vos USDC ?",
      description:
        "Rejoignez des milliers d’utilisateurs qui génèrent un rendement passif sur la DeFi Stellar.",
      connectWallet: "Connecter le wallet",
      openDashboard: "Ouvrir le tableau de bord",
      trust: [
        "✔ Non-custodial",
        "✔ Contrats audités",
        "✔ Aucun blocage",
        "✔ Open source",
      ],
    },
    footer: {
      builtOn: "Construit sur Stellar",
      designTokens: "Tokens de design",
    },
    formatters: {
      updatedPrefix: "Mis à jour",
    },
    dashboard: {
      realtime: {
        noEvents: "Aucun événement pour le moment — démarrez le flux pour voir les mises à jour en direct.",
        simulatedStream: "Flux d'événements simulé",
        firesEvery: "Déclenche des dépôts, des retraits et des rééquilibrages toutes les 4–9 s",
        start: "Démarrer",
        stop: "Arrêter",
        reset: "Réinitialiser",
        eventsFired: "Événements déclenchés",
        deltaBalance: "Δ Solde",
        deltaYield: "Δ Rendement",
        deltaApy: "Δ APY",
        eventLog: "Journal des événements",
        status: {
          live: "En direct",
          paused: "En pause",
          idle: "Inactif",
        },
      },
      portfolio: {
        overview: "Aperçu NeuroWealth",
        overviewDesc: "Solde total, rendement, APY, stratégie, allocation et activité récente sur une seule interface d'évaluation, avec une parité mesurable entre les thèmes clair et sombre.",
        themePreview: "Aperçu du thème",
        lightMode: "Mode clair",
        darkMode: "Mode sombre",
        scenarioPreview: "Aperçu du scénario",
        liveWidgets: "Widgets en direct",
        emptyStates: "États vides",
        loadingWidget: "Chargement de l'état du widget de portefeuille...",
        syncingData: "Synchronisation des données du portefeuille",
        source: "Source",
        sandbox: "Sandbox",
        theme: "Thème",
        unavailableTitle: "Widgets de portefeuille indisponibles",
        unavailableDesc: "Le tableau de bord peut réessayer une fois la connectivité à l'API du portefeuille rétablie.",
        retryWidgets: "Réessayer les widgets",
        allocationTitle: "Allocation d'actifs",
        allocationDesc: "Répartition visible des déploiements entre les paniers de stratégie et le capital de réserve.",
        lines: "lignes d'allocation",
        line: "ligne d'allocation",
        emptyAllocation: "Aucune allocation pour le moment. Ajoutez un dépôt pour voir les positions déployées et la couverture de réserve.",
        loadSample: "Charger des données d'exemple",
        activityTitle: "Activité récente",
        activityDesc: "Derniers dépôts, événements de rendement, rééquilibrages et flux de trésorerie programmés.",
        events: "événements",
        event: "événement",
        emptyActivity: "Aucune activité récente. Les dépôts et rééquilibrages apparaîtront ici dès qu'ils se produiront.",
        noAmount: "Aucun montant",
      },
    },
    settings: {
      index: {
        title: "Paramètres",
        subtitle: "Gérez les préférences de votre compte et votre portefeuille connecté.",
        appearance: {
          title: "Apparence",
          themeTitle: "Thème",
          themeDesc: "Choisissez entre clair, sombre ou préférence système.",
        },
        profile: {
          title: "Profil",
          displayTitle: "Nom d'affichage et Préférences",
          displayDesc: "Modifiez votre nom d'affichage, vos paramètres régionaux, votre fuseau horaire et le format de votre devise.",
          editAction: "Modifier le profil",
          regionTitle: "Langue et Région",
          regionDesc: "Modifiez vos paramètres régionaux et d'affichage.",
          openAction: "Ouvrir",
        },
        wallet: {
          title: "Portefeuille",
          connectedTitle: "Portefeuille connecté",
          connectedDesc: "Connexion du portefeuille Freighter pour la signature des transactions.",
          networkTitle: "Réseau",
          networkDesc: "Basculer entre Stellar Testnet et Mainnet.",
        },
        notifications: {
          title: "Notifications",
          emailTitle: "Alertes par e-mail",
          emailDesc: "Recevez des notifications par e-mail pour les dépôts, retraits et rééquilibrages.",
          whatsappTitle: "Notifications WhatsApp",
          whatsappDesc: "Recevez des mises à jour via la messagerie WhatsApp.",
        },
        security: {
          title: "Sécurité",
          twoFactorTitle: "Authentification à deux facteurs",
          twoFactorDesc: "Ajoutez une couche de sécurité supplémentaire à votre compte.",
          sessionTitle: "Gestion de session",
          sessionDesc: "Afficher et révoquer les sessions actives.",
        },
        region: {
          title: "Région",
          currencyTitle: "Affichage de la devise",
          currencyDesc: "Choisissez votre devise d'affichage préférée (USD, EUR, GBP).",
          openAction: "Ouvrir le profil",
        },
      },
      preferences: {
        title: "Préférences",
        subtitle: "Gérer la langue, le fuseau horaire et les paramètres de devise",
        savedSuccess: "Préférences enregistrées avec succès",
        saveError: "Échec de l'enregistrement des préférences. Veuillez réessayer.",
        localisation: {
          title: "Localisation",
          desc: "Préférences de langue et d'affichage régional",
          localeLabel: "Paramètre régional",
        },
        appearance: {
          title: "Apparence",
          desc: "Préférences de thème et d'affichage visuel",
          themeLabel: "Thème",
          light: "Clair",
          dark: "Sombre",
          system: "Système",
        },
        timeCurrency: {
          title: "Heure et devise",
          desc: "Fuseau horaire et format numérique",
          timezoneLabel: "Fuseau horaire",
          currencyLabel: "Format de devise",
        },
        actions: {
          edit: "Modifier les préférences",
          unsaved: "Modifications non enregistrées",
          cancel: "Annuler",
          save: "Enregistrer",
          saving: "Enregistrement…",
        },
      },
      notifications: {
        title: "Notifications",
        subtitle: "Gérer les alertes que nous envoyons par e-mail, activité du compte et événements de sécurité.",
        channels: {
          title: "Canaux de diffusion",
          desc: "Choisissez les mises à jour qui arrivent dans vos boîtes de réception, tableaux de bord et résumés hebdomadaires.",
          emailTitle: "Notifications par e-mail",
          emailDesc: "Recevez les mises à jour de livraison et les avis de compte dans votre boîte de réception.",
          transactionTitle: "Alertes de transaction",
          transactionDesc: "Envoyer une notification à chaque dépôt, retrait ou rééquilibrage complété.",
          weeklyTitle: "Résumé hebdomadaire",
          weeklyDesc: "Regrouper les résumés de performance et les points saillants en une mise à jour hebdomadaire.",
          productTitle: "Mises à jour du produit",
          productDesc: "Découvrez les lancements, les expériences et les améliorations de la plateforme.",
          securityTitle: "Alertes de sécurité",
          securityDesc: "Notifications critiques de connexion, de portefeuille et d'activité suspecte.",
        },
        summary: {
          title: "Résumé actuel",
          desc: "Suivez les signaux activés avant de publier les modifications.",
          enabledPreferences: "Préférences activées",
          emailChannel: "Canal e-mail",
          active: "Actif",
          muted: "Désactivé",
          securityCoverage: "Couverture de sécurité",
          protected: "Protégé",
          atRisk: "À risque",
        },
        saveBehavior: {
          title: "Comportement de sauvegarde",
          desc: "Les sauvegardes réussies émettent une bannière de succès et un toast. Désactiver les alertes de sécurité simule une sauvegarde bloquée.",
        },
        securityAlertsOff: {
          title: "Les alertes de sécurité sont désactivées",
          desc: "Les événements de compte à haut risque peuvent être manqués jusqu'à ce que vous réactiviez la couverture de sécurité.",
        },
        actions: {
          edit: "Modifier les préférences",
          unsaved: "Modifications non enregistrées",
          noPending: "Aucune modification en attente",
          cancel: "Annuler",
          save: "Enregistrer",
          saving: "Enregistrement...",
          restoreAlerts: "Restaurer les alertes de sécurité",
        },
        toast: {
          savedTitle: "Préférences enregistrées",
          savedDesc: "Vos règles de notification ont été mises à jour pour les futures activités du compte.",
          failTitle: "Échec de l'enregistrement",
          failDesc: "Les alertes de sécurité sont requises dans ce flux simulé. Réactivez-les et réessayez.",
        },
        banner: {
          savedTitle: "Préférences de notification enregistrées",
          failTitle: "Impossible d'enregistrer votre sélection actuelle",
          failDesc: "Ce chemin d'échec simulé bloque intentionnellement la sauvegarde lorsque les alertes de sécurité sont désactivées.",
        },
      },
      security: {
        title: "Sécurité",
        subtitle: "Gérez le mot de passe, l'authentification à deux facteurs et les alertes de connexion de votre compte.",
        banner: {
          success: "Paramètres de sécurité mis à jour avec succès",
          error: "Échec de la mise à jour des paramètres de sécurité. Veuillez réessayer.",
        },
        password: {
          title: "Mot de passe",
          desc: "Protégez votre compte avec un mot de passe fort et régulièrement mis à jour.",
          lastChangedLabel: "Dernière modification",
          daysAgoSuffix: "jours",
          warning: "Votre mot de passe date de plus de 90 jours. Pensez à le mettre à jour.",
          changeAction: "Changer le mot de passe",
        },
        twoFactor: {
          title: "Authentification à deux facteurs",
          desc: "Ajoutez une couche de sécurité supplémentaire à votre compte.",
          enableLabel: "Activer l'authentification à deux facteurs",
          enabledHint: "L'authentification à deux facteurs protège votre compte.",
          disabledHint: "Activez l'authentification à deux facteurs pour une meilleure protection.",
        },
        loginAlerts: {
          title: "Alertes de connexion",
          desc: "Soyez averti chaque fois qu'un nouvel appareil se connecte à votre compte.",
          enableLabel: "Activer les alertes de connexion",
          enabledHint: "Vous serez averti des nouvelles connexions.",
          disabledHint: "Vous ne serez pas averti des nouvelles connexions.",
        },
        actions: {
          edit: "Modifier les paramètres de sécurité",
          unsaved: "Modifications non enregistrées",
          cancel: "Annuler",
          save: "Enregistrer les modifications",
          saving: "Enregistrement…",
        },
        modal: {
          title: "Changer le mot de passe",
          closeLabel: "Fermer",
          newPasswordLabel: "Nouveau mot de passe",
          newPasswordPlaceholder: "Entrez le nouveau mot de passe",
          cancel: "Annuler",
          updating: "Mise à jour…",
          update: "Mettre à jour le mot de passe",
        },
      },
      privacy: {
        title: "Confidentialité",
        subtitle: "Contrôlez la façon dont NeuroWealth utilise les cookies et les données sur votre appareil.",
        cookieSection: {
          title: "Préférences cookies & confidentialité",
          desc: "Consultez votre statut de consentement actuel et ajustez les catégories de cookies actives.",
        },
      },
      strategies: {
        eyebrow: "Paramètres",
        title: "Choisissez votre stratégie",
        description: "Sélectionnez le profil de risque/rendement qui correspond à vos objectifs. Vos positions actives seront rééquilibrées lors du prochain cycle programmé.",
        backToPortfolio: "Retour au portefeuille",
        currentBadge: "Actuelle",
        activeStrategyButton: "Stratégie active",
        comparison: {
          title: "Comparaison des stratégies",
          featureHeader: "Caractéristique",
          activeBadge: "active",
          apyRangeLabel: "Plage de rendement",
          riskLevelLabel: "Niveau de risque",
        },
        success: {
          updated: "Stratégie mise à jour vers {{strategy}}. Le rééquilibrage s'appliquera au prochain cycle programmé.",
        },
        confirmModal: {
          title: "Confirmer le changement de stratégie",
          switchingFrom: "Passage de {{from}} à {{to}}.",
          settingTo: "Définition de votre stratégie sur {{to}}.",
          note: "Les positions actives seront rééquilibrées lors du prochain cycle programmé. Ce changement ne déclenche pas de transaction on-chain immédiate.",
          cancel: "Annuler",
          confirm: "Confirmer le changement",
          saving: "Enregistrement…",
          closeLabel: "Annuler",
        },
        cards: {
          conservative: {
            title: "Conservateur",
            riskLabel: "Risque faible",
            description: "Prêt en stablecoins et couverture de réserve inactive. Préservation du capital avec rendement prévisible et exposition minimale aux baisses.",
            primaryAction: "Choisir Conservateur",
          },
          balanced: {
            title: "Équilibré",
            riskLabel: "Risque moyen",
            description: "Rendement réparti entre le prêt Blend, la liquidité DEX et une réserve stable. Idéal pour une croissance régulière avec une volatilité maîtrisée.",
            primaryAction: "Choisir Équilibré",
          },
          growth: {
            title: "Croissance",
            riskLabel: "Risque élevé",
            description: "Mise sur les programmes d'incitation, le rééquilibrage actif et des positions à volatilité plus élevée. Potentiel maximal avec risque accru.",
            primaryAction: "Choisir Croissance",
          },
        },
      },
      onboarding: {
        title: "Paramètres d'intégration",
        subtitle: "Gérez votre progression d'intégration et révisez les étapes de configuration.",
        statusLabel: "Statut",
        statusCompleted: "Terminé",
        statusInProgress: "En cours",
        lastStepLabel: "Dernière étape :",
        lastStepValue: "Étape {{step}}",
        completedLabel: "Terminé :",
        actionsTitle: "Actions",
        reviewAction: "Revoir l'intégration",
        resetAction: "Réinitialiser l'intégration",
        resetting: "Réinitialisation...",
        confirmReset: "Voulez-vous vraiment réinitialiser le processus d'intégration ? Vous pourrez suivre à nouveau la configuration.",
        toastFailTitle: "Échec de la réinitialisation de l'intégration",
        toastFailDesc: "Veuillez réessayer.",
        helpReviewLabel: "Revoir l'intégration :",
        helpReviewDesc: "Parcourez à nouveau les étapes de configuration sans modifier vos paramètres actuels.",
        helpResetLabel: "Réinitialiser l'intégration :",
        helpResetDesc: "Effacez toute la progression d'intégration et recommencez depuis le début.",
      },
      themeSelector: {
        ariaLabel: "Sélection du thème",
      },
    },
  },
};
