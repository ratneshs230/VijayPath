import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { Voter, Resource, CampaignEvent, PlannerTask, VoterStatus, Mohalla, Household, Influencer, EnhancedVoter } from '../../types';
import {
  subscribeToVoters,
  addVoter as addVoterService,
  updateVoter as updateVoterService,
  deleteVoter as deleteVoterService,
  seedVoters
} from '../firebase/services/voters';
import {
  subscribeToResources,
  addResource as addResourceService,
  updateResource as updateResourceService,
  deleteResource as deleteResourceService,
  seedResources
} from '../firebase/services/resources';
import {
  subscribeToEvents,
  addEvent as addEventService,
  updateEvent as updateEventService,
  deleteEvent as deleteEventService,
  seedEvents
} from '../firebase/services/events';
import {
  subscribeToTasks,
  addTask as addTaskService,
  updateTask as updateTaskService,
  deleteTask as deleteTaskService,
  seedTasks
} from '../firebase/services/planner';
import {
  subscribeToMohallas,
  addMohalla as addMohallaService,
  updateMohalla as updateMohallaService,
  deleteMohalla as deleteMohallaService,
  seedMohallasFromWards
} from '../firebase/services/mohallas';
import {
  subscribeToHouseholds,
  addHousehold as addHouseholdService,
  updateHousehold as updateHouseholdService,
  deleteHousehold as deleteHouseholdService
} from '../firebase/services/households';
import {
  subscribeToInfluencers,
  addInfluencer as addInfluencerService,
  updateInfluencer as updateInfluencerService,
  deleteInfluencer as deleteInfluencerService
} from '../firebase/services/influencers';
import {
  subscribeToEnhancedVoters,
  addEnhancedVoter as addEnhancedVoterService,
  updateEnhancedVoter as updateEnhancedVoterService,
  deleteEnhancedVoter as deleteEnhancedVoterService
} from '../firebase/services/enhancedVoters';
import { subscribeToAuthState, logOut } from '../firebase/services/auth';
import { INITIAL_VOTERS, INITIAL_RESOURCES, INITIAL_EVENTS, INITIAL_PLANNER } from '../../constants';

// Campaign settings type
interface CampaignSettings {
  electionDate: string;
  candidateName: string;
  wards: string[];
}

// Context state type
interface AppContextState {
  // Auth
  user: User | null;
  isAuthLoading: boolean;
  signOut: () => Promise<void>;

  // Data
  voters: Voter[];
  resources: Resource[];
  events: CampaignEvent[];
  tasks: PlannerTask[];
  settings: CampaignSettings;

  // NEW: Hierarchical data
  mohallas: Mohalla[];
  households: Household[];
  influencers: Influencer[];
  enhancedVoters: EnhancedVoter[];

  // Loading states
  isLoading: boolean;

  // Selected date for planner
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  // Voter actions
  addVoter: (voter: Omit<Voter, 'id'>) => Promise<string>;
  updateVoter: (id: string, voter: Partial<Voter>) => Promise<void>;
  deleteVoter: (id: string) => Promise<void>;

  // Resource actions
  addResource: (resource: Omit<Resource, 'id'>) => Promise<string>;
  updateResource: (id: string, resource: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;

  // Event actions
  addEvent: (event: Omit<CampaignEvent, 'id'>) => Promise<string>;
  updateEvent: (id: string, event: Partial<CampaignEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  // Task actions
  addTask: (task: Omit<PlannerTask, 'id'>) => Promise<string>;
  updateTask: (id: string, task: Partial<PlannerTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // NEW: Mohalla actions
  addMohalla: (mohalla: Omit<Mohalla, 'id'>) => Promise<string>;
  updateMohalla: (id: string, mohalla: Partial<Mohalla>) => Promise<void>;
  deleteMohalla: (id: string) => Promise<void>;

  // NEW: Household actions
  addHousehold: (household: Omit<Household, 'id' | 'displayId' | 'totalVoters' | 'maleVoters' | 'femaleVoters'>) => Promise<string>;
  updateHousehold: (id: string, household: Partial<Household>) => Promise<void>;
  deleteHousehold: (id: string, mohallaId?: string) => Promise<void>;

  // NEW: Influencer actions
  addInfluencer: (influencer: Omit<Influencer, 'id'>) => Promise<string>;
  updateInfluencer: (id: string, influencer: Partial<Influencer>) => Promise<void>;
  deleteInfluencer: (id: string) => Promise<void>;

  // NEW: Enhanced Voter actions
  addEnhancedVoter: (voter: Omit<EnhancedVoter, 'id'>, userId?: string) => Promise<string>;
  updateEnhancedVoter: (id: string, voter: Partial<EnhancedVoter>, oldGender?: 'Male' | 'Female' | 'Other', oldHouseholdId?: string, oldMohallaId?: string) => Promise<void>;
  deleteEnhancedVoter: (id: string, voter: EnhancedVoter) => Promise<void>;

  // Computed stats
  stats: {
    totalVoters: number;
    favorableVoters: number;
    diceyVoters: number;
    unfavorableVoters: number;
    totalBudget: number;
    spentBudget: number;
    daysToElection: number;
    // NEW: Hierarchical stats
    totalMohallas: number;
    totalHouseholds: number;
    totalInfluencers: number;
    totalEnhancedVoters: number;
  };
}

// Default settings
const defaultSettings: CampaignSettings = {
  electionDate: '2026-04-15', // Default election date
  candidateName: 'Campaign Candidate',
  wards: ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4']
};

// Create context
const AppContext = createContext<AppContextState | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Data state
  const [voters, setVoters] = useState<Voter[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [events, setEvents] = useState<CampaignEvent[]>([]);
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [settings] = useState<CampaignSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // NEW: Hierarchical data state
  const [mohallas, setMohallas] = useState<Mohalla[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [enhancedVoters, setEnhancedVoters] = useState<EnhancedVoter[]>([]);

  // Selected date for planner
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Subscribe to auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuthState((user) => {
      setUser(user);
      setIsAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Subscribe to Firestore data (only when authenticated)
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Track which subscriptions have returned their first data using a Set
    // This prevents the race condition where the same subscription firing multiple times
    // could prematurely trigger loading complete
    const loadedSubscriptions = new Set<string>();
    const requiredSubscriptions = [
      'voters', 'resources', 'events', 'tasks',
      'mohallas', 'households', 'influencers', 'enhancedVoters'
    ];

    const markLoaded = (subscriptionName: string) => {
      loadedSubscriptions.add(subscriptionName);
      // Only set loading to false when ALL subscriptions have returned first data
      if (loadedSubscriptions.size >= requiredSubscriptions.length) {
        setIsLoading(false);
      }
    };

    // Seed initial data if needed (only runs once per collection if empty)
    const seedData = async () => {
      try {
        await seedVoters(INITIAL_VOTERS);
        await seedResources(INITIAL_RESOURCES);
        await seedEvents(INITIAL_EVENTS);
        await seedTasks(INITIAL_PLANNER);
        // Seed mohallas from existing wards
        await seedMohallasFromWards(settings.wards, user.uid);
      } catch (error) {
        console.error('Error seeding data:', error);
      }
    };
    seedData();

    // Subscribe to voters
    const unsubVoters = subscribeToVoters((data) => {
      setVoters(data);
      markLoaded('voters');
    });

    // Subscribe to resources
    const unsubResources = subscribeToResources((data) => {
      setResources(data);
      markLoaded('resources');
    });

    // Subscribe to events
    const unsubEvents = subscribeToEvents((data) => {
      setEvents(data);
      markLoaded('events');
    });

    // Subscribe to tasks
    const unsubTasks = subscribeToTasks((data) => {
      setTasks(data);
      markLoaded('tasks');
    }, selectedDate);

    // Subscribe to mohallas
    const unsubMohallas = subscribeToMohallas((data) => {
      setMohallas(data);
      markLoaded('mohallas');
    });

    // Subscribe to households
    const unsubHouseholds = subscribeToHouseholds((data) => {
      setHouseholds(data);
      markLoaded('households');
    });

    // Subscribe to influencers
    const unsubInfluencers = subscribeToInfluencers((data) => {
      setInfluencers(data);
      markLoaded('influencers');
    });

    // Subscribe to enhanced voters
    const unsubEnhancedVoters = subscribeToEnhancedVoters((data) => {
      setEnhancedVoters(data);
      markLoaded('enhancedVoters');
    });

    return () => {
      unsubVoters();
      unsubResources();
      unsubEvents();
      unsubTasks();
      unsubMohallas();
      unsubHouseholds();
      unsubInfluencers();
      unsubEnhancedVoters();
    };
  }, [user, selectedDate, settings.wards]);

  // Sign out
  const handleSignOut = useCallback(async () => {
    await logOut();
  }, []);

  // Voter actions
  const addVoter = useCallback(async (voter: Omit<Voter, 'id'>) => {
    return await addVoterService(voter);
  }, []);

  const updateVoter = useCallback(async (id: string, voter: Partial<Voter>) => {
    await updateVoterService(id, voter);
  }, []);

  const deleteVoter = useCallback(async (id: string) => {
    await deleteVoterService(id);
  }, []);

  // Resource actions
  const addResource = useCallback(async (resource: Omit<Resource, 'id'>) => {
    return await addResourceService(resource);
  }, []);

  const updateResource = useCallback(async (id: string, resource: Partial<Resource>) => {
    await updateResourceService(id, resource);
  }, []);

  const deleteResource = useCallback(async (id: string) => {
    await deleteResourceService(id);
  }, []);

  // Event actions
  const addEvent = useCallback(async (event: Omit<CampaignEvent, 'id'>) => {
    return await addEventService(event);
  }, []);

  const updateEvent = useCallback(async (id: string, event: Partial<CampaignEvent>) => {
    await updateEventService(id, event);
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    await deleteEventService(id);
  }, []);

  // Task actions
  const addTask = useCallback(async (task: Omit<PlannerTask, 'id'>) => {
    return await addTaskService({ ...task, date: selectedDate });
  }, [selectedDate]);

  const updateTask = useCallback(async (id: string, task: Partial<PlannerTask>) => {
    await updateTaskService(id, task);
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await deleteTaskService(id);
  }, []);

  // NEW: Mohalla actions
  const addMohalla = useCallback(async (mohalla: Omit<Mohalla, 'id'>) => {
    return await addMohallaService(mohalla);
  }, []);

  const updateMohalla = useCallback(async (id: string, mohalla: Partial<Mohalla>) => {
    await updateMohallaService(id, mohalla);
  }, []);

  const deleteMohalla = useCallback(async (id: string) => {
    await deleteMohallaService(id);
  }, []);

  // NEW: Household actions
  const addHousehold = useCallback(async (household: Omit<Household, 'id' | 'displayId' | 'totalVoters' | 'maleVoters' | 'femaleVoters'>) => {
    return await addHouseholdService(household);
  }, []);

  const updateHousehold = useCallback(async (id: string, household: Partial<Household>) => {
    await updateHouseholdService(id, household);
  }, []);

  const deleteHousehold = useCallback(async (id: string, mohallaId?: string) => {
    await deleteHouseholdService(id, mohallaId);
  }, []);

  // NEW: Influencer actions
  const addInfluencer = useCallback(async (influencer: Omit<Influencer, 'id'>) => {
    return await addInfluencerService(influencer);
  }, []);

  const updateInfluencer = useCallback(async (id: string, influencer: Partial<Influencer>) => {
    await updateInfluencerService(id, influencer);
  }, []);

  const deleteInfluencer = useCallback(async (id: string) => {
    await deleteInfluencerService(id);
  }, []);

  // NEW: Enhanced Voter actions
  const addEnhancedVoter = useCallback(async (voter: Omit<EnhancedVoter, 'id'>, userId?: string) => {
    return await addEnhancedVoterService(voter, userId || user?.uid);
  }, [user]);

  const updateEnhancedVoter = useCallback(async (
    id: string,
    voter: Partial<EnhancedVoter>,
    oldGender?: 'Male' | 'Female' | 'Other',
    oldHouseholdId?: string,
    oldMohallaId?: string
  ) => {
    await updateEnhancedVoterService(id, voter, oldGender, oldHouseholdId, oldMohallaId);
  }, []);

  const deleteEnhancedVoter = useCallback(async (id: string, voter: EnhancedVoter) => {
    await deleteEnhancedVoterService(id, voter);
  }, []);

  // Computed stats - using EnhancedVoters for accurate voter classification
  const stats = React.useMemo(() => {
    // Use enhancedVoters for accurate stats (voterType field)
    // Fall back to legacy voters only if enhancedVoters is empty
    const totalVoters = enhancedVoters.length > 0 ? enhancedVoters.length : voters.length;

    // Calculate voter sentiment based on voterType from EnhancedVoter
    // Confirmed + Likely = Favorable, Swing = Dicey, Opposition + Unknown = Unfavorable
    const favorableVoters = enhancedVoters.length > 0
      ? enhancedVoters.filter(v => v.voterType === 'Confirmed' || v.voterType === 'Likely').length
      : voters.filter(v => v.status === VoterStatus.FAVORABLE).length;

    const diceyVoters = enhancedVoters.length > 0
      ? enhancedVoters.filter(v => v.voterType === 'Swing' || v.voterType === 'Unknown').length
      : voters.filter(v => v.status === VoterStatus.DICEY).length;

    const unfavorableVoters = enhancedVoters.length > 0
      ? enhancedVoters.filter(v => v.voterType === 'Opposition').length
      : voters.filter(v => v.status === VoterStatus.UNFAVORABLE).length;

    const budgetResources = resources.filter(r => r.type === 'BUDGET');
    const totalBudget = budgetResources.reduce((sum, r) => sum + r.quantity, 0);
    const spentBudget = budgetResources.reduce((sum, r) => sum + r.allocated, 0);

    const electionDate = new Date(settings.electionDate);
    const today = new Date();
    const daysToElection = Math.max(0, Math.ceil((electionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      totalVoters,
      favorableVoters,
      diceyVoters,
      unfavorableVoters,
      totalBudget,
      spentBudget,
      daysToElection,
      // Hierarchical stats
      totalMohallas: mohallas.length,
      totalHouseholds: households.length,
      totalInfluencers: influencers.length,
      totalEnhancedVoters: enhancedVoters.length
    };
  }, [voters, resources, settings.electionDate, mohallas, households, influencers, enhancedVoters]);

  const value: AppContextState = {
    user,
    isAuthLoading,
    signOut: handleSignOut,
    voters,
    resources,
    events,
    tasks,
    settings,
    // NEW: Hierarchical data
    mohallas,
    households,
    influencers,
    enhancedVoters,
    isLoading,
    selectedDate,
    setSelectedDate,
    addVoter,
    updateVoter,
    deleteVoter,
    addResource,
    updateResource,
    deleteResource,
    addEvent,
    updateEvent,
    deleteEvent,
    addTask,
    updateTask,
    deleteTask,
    // NEW: Hierarchical actions
    addMohalla,
    updateMohalla,
    deleteMohalla,
    addHousehold,
    updateHousehold,
    deleteHousehold,
    addInfluencer,
    updateInfluencer,
    deleteInfluencer,
    // NEW: Enhanced Voter actions
    addEnhancedVoter,
    updateEnhancedVoter,
    deleteEnhancedVoter,
    stats
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook to use the context
export const useApp = (): AppContextState => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
