import React, { createContext, useContext, useState, useEffect } from 'react';

// Define Data Structures

export type UserRole = 'Employee' | 'Manager' | 'CTO' | 'COO' | 'CEO';

export interface Manager {
  id: string;
  name: string;
  department: 'Technology' | 'Operations';
  role: string;
  avatar: string;
}

export interface Employee {
  id: string;
  name: string;
  department: 'Technology' | 'Operations';
  role: string;
  avatar: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ActionPlan {
  id: string;
  title: string;
  description: string;
  expectedImpact: string;
  estimatedTime: string;
  businessValue: string;
  instructions?: string;
  deadline?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  checklist: ChecklistItem[];
  proofUrl?: string;
  proofFileName?: string;
  progress: number; // percentage 0-100
  completedAt?: string;
  completionNotes?: string;
}

export interface Submission {
  id: string;
  type: 'Feedback' | 'Concern' | 'Suggestion' | 'Survey';
  title: string;
  description: string;
  expectedBenefits?: string; // only for Suggestions
  department: 'Technology' | 'Operations';
  date: string;
  status: 'Pending Review' | 'In Progress' | 'Resolved' | 'Verified';
  aiCategory: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  evidenceScore: number; // 0-100
  evidenceBreakdown: string[];
  intelligenceSummary: string;
  confidence: number; // AI confidence score 0-100
  assignedExecutive: 'CTO' | 'COO';
  assignedManagerId?: string;
  actionPlan: ActionPlan | null;
  verification: {
    improvementRating: 'Yes' | 'Partially' | 'No';
    comments: string;
    score: number; // 1-5
    date: string;
  } | null;
  evidenceFiles?: { name: string; size: string; type: string }[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  role: UserRole;
  targetPath?: string;
}

export interface SurveyResponse {
  id: string;
  date: string;
  ratings: {
    communication: number; // 1-5
    growth: number;
    managerSupport: number;
    environment: number;
    recognition: number;
    workLifeBalance: number;
  };
  comments: string;
}

interface ResolveContextType {
  currentUserRole: UserRole;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar: string;
  currentUserDept: 'Technology' | 'Operations';
  setCurrentUserRole: (role: UserRole) => void;
  submissions: Submission[];
  notifications: Notification[];
  managers: Manager[];
  employees: Employee[];
  surveyResponses: SurveyResponse[];
  addSubmission: (submission: Omit<Submission, 'id' | 'date' | 'status' | 'aiCategory' | 'priority' | 'evidenceScore' | 'evidenceBreakdown' | 'intelligenceSummary' | 'confidence' | 'assignedExecutive' | 'actionPlan' | 'verification'>) => string;
  assignActionPlan: (submissionId: string, actionPlan: Omit<ActionPlan, 'progress'>, managerId: string, priority: 'Low' | 'Medium' | 'High' | 'Critical', deadline: string, instructions: string) => void;
  updateManagerActionProgress: (submissionId: string, checklist: ChecklistItem[], progress: number, notes?: string, file?: { name: string; url: string }) => void;
  completeManagerAction: (submissionId: string, notes: string, file?: { name: string; url: string }) => void;
  submitEmployeeVerification: (submissionId: string, rating: 'Yes' | 'Partially' | 'No', score: number, comments: string) => void;
  markNotificationsAsRead: (role: UserRole) => void;
}

const ResolveContext = createContext<ResolveContextType | undefined>(undefined);

// Initial Static Data
const INITIAL_MANAGERS: Manager[] = [
  { id: 'mgr-1', name: 'Sophia Rodriguez', department: 'Technology', role: 'Engineering Manager - Infrastructure', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { id: 'mgr-2', name: 'Alex Kim', department: 'Technology', role: 'Engineering Lead - Core Platform', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: 'mgr-3', name: 'Emily Chen', department: 'Operations', role: 'Operations & Logistics Manager', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
  { id: 'mgr-4', name: 'Michael Vance', department: 'Operations', role: 'HR Operations Lead', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' }
];

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: 'Sarah Chen', department: 'Technology', role: 'Senior Software Engineer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  { id: 'emp-2', name: 'David Miller', department: 'Technology', role: 'Frontend Architect', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' },
  { id: 'emp-3', name: 'Priya Patel', department: 'Operations', role: 'Customer Success Specialist', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' },
  { id: 'emp-4', name: 'Marcus Thompson', department: 'Operations', role: 'Logistics Analyst', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150' }
];

const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-101',
    type: 'Concern',
    title: 'Outdated staging database environment causing frequent sprint bottlenecks',
    description: 'The staging database has not been synced with production schemas in 6 months. Every schema migration triggers timeout errors, locking up the server and blocking our daily deployments. This delays our feature releases by an average of 2-3 days per cycle.',
    department: 'Technology',
    date: '2026-06-25',
    status: 'In Progress',
    aiCategory: 'Developer Experience & Infrastructure',
    priority: 'High',
    evidenceScore: 89,
    evidenceBreakdown: [
      'Git repo commit history logs 14 failed staging deployments in the last 30 days.',
      'Sentry error rates confirm 45 database lockup exceptions during sprint integrations.',
      'Previous pulse surveys highlighted infrastructure bottlenecks in this specific team.',
      'Document staging_error_logs.pdf uploaded by the user.'
    ],
    intelligenceSummary: 'The user reports severe staging server lags due to database migration failures. Automated logs match this timeline with 92% correlation, indicating a systemic infrastructure bottleneck rather than local developer configuration issues.',
    confidence: 94,
    assignedExecutive: 'CTO',
    assignedManagerId: 'mgr-1',
    evidenceFiles: [{ name: 'staging_error_logs.pdf', size: '1.2 MB', type: 'application/pdf' }],
    actionPlan: {
      id: 'plan-101',
      title: 'Staging Database Optimization & Schema Sync automation',
      description: 'Rebuild staging database replication pipeline, run schema syncs on a bi-weekly cron job, and expand staging resources to match 20% of production peak traffic.',
      expectedImpact: 'Reduce staging server timeout exceptions to <1% and cut deployment cycle blockages.',
      estimatedTime: '2 weeks',
      businessValue: 'Increases engineering team velocity by estimated 15% and guarantees faster release cycles.',
      priority: 'High',
      deadline: '2026-07-10',
      instructions: 'Please coordinate with DevOps to implement the cron schema replication. Setup monitoring logs in Grafana.',
      progress: 60,
      checklist: [
        { id: 'chk-1', text: 'Audit staging schema differences against production', completed: true },
        { id: 'chk-2', text: 'Write database replication script for automated staging sync', completed: true },
        { id: 'chk-3', text: 'Deploy cron job in staging environment', completed: false },
        { id: 'chk-4', text: 'Validate migrations with 5 sample schema pushes', completed: false }
      ]
    },
    verification: null
  },
  {
    id: 'sub-102',
    type: 'Feedback',
    title: 'Lack of clear career advancement tracks in technical contributor paths',
    description: 'Many senior developers feel that in order to progress, they are forced to shift to management tracks. We need a dual-ladder progression plan where senior engineers can advance to Principal and Distinguished levels without taking on HR and reporting overhead.',
    department: 'Technology',
    date: '2026-06-28',
    status: 'Pending Review',
    aiCategory: 'Career Development & Growth',
    priority: 'Medium',
    evidenceScore: 72,
    evidenceBreakdown: [
      'Two senior engineer resignations in the last quarter cited "lack of growth paths" in exit interviews.',
      'HR review records show zero technical track promotions above "Staff Engineer" level in the last 18 months.',
      'External market research shows 80% of peer tech firms offer fully fleshed dual-track ladders.'
    ],
    intelligenceSummary: 'Feedback requests a technical contributor career path. Internal hiring trends and exit reviews support this as a potential retention issue for core staff engineers.',
    confidence: 88,
    assignedExecutive: 'CTO',
    actionPlan: null,
    verification: null
  },
  {
    id: 'sub-103',
    type: 'Suggestion',
    title: 'Introduce a structured vendor management portal to cut delivery delays',
    description: 'We currently communicate with our logistics vendors via ad-hoc emails and spreadsheets, leading to a high rate of missing tracking IDs and shipment check-in delays at the warehouses. A shared supplier web dashboard would automate tracking updates.',
    expectedBenefits: 'Expected to reduce warehouse intake delays by 35% and save roughly 12 manual coordination hours weekly per coordinator.',
    department: 'Operations',
    date: '2026-06-29',
    status: 'Pending Review',
    aiCategory: 'Operational Efficiency',
    priority: 'Medium',
    evidenceScore: 82,
    evidenceBreakdown: [
      'Logistics report shows 22% of inbound shipments suffered check-in delays due to missing paperwork.',
      'Warehouse email logs show an average of 4.2 follow-up messages per inbound vendor order.',
      'Calculated labor hours spent manually copying tracking codes is approximately 45 hours/month.'
    ],
    intelligenceSummary: 'The user proposes digitizing tracking updates for suppliers. Operations analytics confirm high administrative overhead in tracking validation and warehouse delays.',
    confidence: 90,
    assignedExecutive: 'COO',
    actionPlan: null,
    verification: null
  },
  {
    id: 'sub-104',
    type: 'Concern',
    title: 'Continuous overtime in fulfillment centers due to inefficient shift planning',
    description: 'Warehouse staff are routinely asked to extend shifts by 2-3 hours with short notice because shipping volumes are calculated on weekly averages rather than real-time daily order backlogs. This is causing physical burnout and high attrition.',
    department: 'Operations',
    date: '2026-06-20',
    status: 'Resolved',
    aiCategory: 'Work Environment & Safety',
    priority: 'High',
    evidenceScore: 91,
    evidenceBreakdown: [
      'Timecard logs show overtime hours in Operations increased by 28% month-over-month.',
      'Warehouse employee attrition rate rose from 4% to 11% this quarter.',
      'System alerts recorded 8 shifts exceeding safety time caps in June.'
    ],
    intelligenceSummary: 'Reports center burnout due to sudden shift changes. Payroll and timesheet verification confirms high overtime metrics in Operations centers during mid-week spikes.',
    confidence: 96,
    assignedExecutive: 'COO',
    assignedManagerId: 'mgr-3',
    actionPlan: {
      id: 'plan-102',
      title: 'Dynamic Shift Scheduler Implementation',
      description: 'Integrate real-time order backlog data with employee scheduling tools to forecast packing workloads and adjust shifts 48 hours in advance.',
      expectedImpact: 'Reduce unplanned overtime by 50% and raise operator satisfaction metrics.',
      estimatedTime: '3 weeks',
      businessValue: 'Lowers high attrition costs and minimizes compliance risks regarding shift lengths.',
      priority: 'High',
      deadline: '2026-06-30',
      instructions: 'Roll out the dynamic scheduler at the Dallas fulfillment hub as a pilot. Sync with shift supervisors daily.',
      progress: 100,
      checklist: [
        { id: 'chk-5', text: 'Integrate order system APIs with scheduling database', completed: true },
        { id: 'chk-6', text: 'Train shift supervisors on dynamic scheduling dashboard', completed: true },
        { id: 'chk-7', text: 'Implement 48-hour shift confirmation protocol', completed: true }
      ],
      proofUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
      proofFileName: 'dallas_pilot_schedule_report.xlsx',
      completedAt: '2026-06-30',
      completionNotes: 'Successfully completed the pilot rollout in Dallas. Overtime requests have dropped from average 12 hours/week to 2.4 hours/week for staff, and scheduler reviews are positive.'
    },
    verification: null
  },
  {
    id: 'sub-105',
    type: 'Concern',
    title: 'Delayed performance reviews and inconsistent feedback loops',
    description: 'Multiple members in our operations support teams have not received their mid-year reviews. This leaves staff in the dark regarding performance criteria and compensation increases, which is stalling team morale.',
    department: 'Operations',
    date: '2026-06-15',
    status: 'Verified',
    aiCategory: 'Work Environment & Safety',
    priority: 'Low',
    evidenceScore: 95,
    evidenceBreakdown: [
      'HR review logs verify that 34% of operations staff reviews are overdue by 30+ days.',
      'Similar feedback reports submitted by 4 other operations specialists in Q2.',
      'Employee review backlog metrics in Workday are currently red-flagged.'
    ],
    intelligenceSummary: 'Review completion delays are confirmed by HR systems. Over 30% of reviews are past their scheduled date, leading to uncertainty about compensation adjustments.',
    confidence: 98,
    assignedExecutive: 'COO',
    assignedManagerId: 'mgr-4',
    actionPlan: {
      id: 'plan-103',
      title: 'Operations Performance Audit & Backlog Clearance',
      description: 'Establish automated reminders for managers and schedule dedicated review cycles to clear the backlog within 15 days.',
      expectedImpact: '100% completion of overdue reviews and standardized feedback loops.',
      estimatedTime: '10 days',
      businessValue: 'Mitigates staff churn risks and aligns teams on organizational milestones.',
      priority: 'Medium',
      deadline: '2026-06-25',
      instructions: 'Run automated reports on overdue reviews. Coordinate weekly check-ins with managers failing to submit evaluations.',
      progress: 100,
      checklist: [
        { id: 'chk-8', text: 'Extract list of all overdue employee reviews', completed: true },
        { id: 'chk-9', text: 'Conduct review workshops for operations managers', completed: true },
        { id: 'chk-10', text: 'Complete all pending reviews in HR portals', completed: true }
      ],
      proofUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
      proofFileName: 'hr_review_completion_summary.pdf',
      completedAt: '2026-06-24',
      completionNotes: 'All 18 overdue reviews in Operations Support have been finalized. Feedback forms signed off by employees.'
    },
    verification: {
      improvementRating: 'Yes',
      comments: 'I finally had my review session and standard milestones were established. My manager committed to monthly alignment check-ins.',
      score: 5,
      date: '2026-06-26'
    }
  }
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'n-1', title: 'New Submission Routed', message: 'A critical concern on "Staging Database Environments" has been routed to you.', time: '2 hours ago', read: false, role: 'CTO' },
  { id: 'n-2', title: 'Action Assigned', message: 'CTO has assigned "Staging Database Optimization" to your queue.', time: '1 hour ago', read: false, role: 'Manager' },
  { id: 'n-3', title: 'Action Completed', message: 'Manager Emily Chen completed "Dynamic Shift Scheduler". Needs employee verification.', time: '1 day ago', read: false, role: 'Employee' },
  { id: 'n-4', title: 'Escalation Alert', message: 'Operations department health index has dipped to 74% due to overtime reviews backlog.', time: '3 hours ago', read: false, role: 'CEO' },
  { id: 'n-5', title: 'New Feedback Received', message: 'A career growth path suggestion has been submitted in Tech.', time: '4 hours ago', read: true, role: 'CTO' }
];

const INITIAL_SURVEYS: SurveyResponse[] = [
  { id: 's-1', date: '2026-06-01', ratings: { communication: 4, growth: 3, managerSupport: 4, environment: 3, recognition: 4, workLifeBalance: 3 }, comments: 'Decent environment, but growth tracks are unclear.' },
  { id: 's-2', date: '2026-06-10', ratings: { communication: 3, growth: 3, managerSupport: 3, environment: 4, recognition: 3, workLifeBalance: 4 }, comments: 'Work life balance is stable. Looking for more technical training.' },
  { id: 's-3', date: '2026-06-20', ratings: { communication: 2, growth: 2, managerSupport: 4, environment: 2, recognition: 3, workLifeBalance: 2 }, comments: 'Severe bottlenecks in deployments are causing stressful evenings.' },
  { id: 's-4', date: '2026-06-28', ratings: { communication: 4, growth: 4, managerSupport: 5, environment: 4, recognition: 4, workLifeBalance: 4 }, comments: 'Great support from Sophia, she schedules 1on1s regularly.' }
];

export const ResolveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Global State
  const [currentUserRole, setCurrentUserRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('resolve_role') as UserRole) || 'Employee';
  });
  
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem('resolve_submissions');
    return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('resolve_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>(() => {
    const saved = localStorage.getItem('resolve_surveys');
    return saved ? JSON.parse(saved) : INITIAL_SURVEYS;
  });

  useEffect(() => {
    localStorage.setItem('resolve_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('resolve_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('resolve_surveys', JSON.stringify(surveyResponses));
  }, [surveyResponses]);

  const setCurrentUserRole = (role: UserRole) => {
    setCurrentUserRoleState(role);
    localStorage.setItem('resolve_role', role);
  };

  // Determine User Context metadata based on Active Role
  let currentUserId = 'emp-1';
  let currentUserName = 'Sarah Chen';
  let currentUserAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
  let currentUserDept: 'Technology' | 'Operations' = 'Technology';

  if (currentUserRole === 'Manager') {
    currentUserId = 'mgr-1';
    currentUserName = 'Sophia Rodriguez';
    currentUserAvatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150';
    currentUserDept = 'Technology';
  } else if (currentUserRole === 'CTO') {
    currentUserId = 'exec-cto';
    currentUserName = 'Dr. Aris Thorne';
    currentUserAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150';
    currentUserDept = 'Technology';
  } else if (currentUserRole === 'COO') {
    currentUserId = 'exec-coo';
    currentUserName = 'Marcus Sterling';
    currentUserAvatar = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150';
    currentUserDept = 'Operations';
  } else if (currentUserRole === 'CEO') {
    currentUserId = 'exec-ceo';
    currentUserName = 'Victoria Vance';
    currentUserAvatar = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150';
    currentUserDept = 'Technology'; // default
  }

  // Mutators

  // Employee Submits
  const addSubmission = (newSub: Omit<Submission, 'id' | 'date' | 'status' | 'aiCategory' | 'priority' | 'evidenceScore' | 'evidenceBreakdown' | 'intelligenceSummary' | 'confidence' | 'assignedExecutive' | 'actionPlan' | 'verification'>) => {
    const id = `sub-${Math.floor(100 + Math.random() * 900)}`;
    const date = new Date().toISOString().split('T')[0];
    
    // Simulate AI smart parameters based on keyword matching
    let aiCategory = 'General Organizational Wellness';
    let priority: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
    let evidenceScore = 65; // base score
    let confidence = 85;
    let evidenceBreakdown = [
      'AI validation scans current channels and team surveys.',
      'System correlates submission content with team metrics.',
      'No explicit file verification requested.'
    ];
    let intelligenceSummary = '';

    const textInput = (newSub.title + ' ' + newSub.description).toLowerCase();

    if (newSub.type === 'Survey') {
      // Create survey structure and add to survey state
      const ratings = (newSub as any).ratings || { communication: 3, growth: 3, managerSupport: 3, environment: 3, recognition: 3, workLifeBalance: 3 };
      const newSurveyRes: SurveyResponse = {
        id: `s-${Math.floor(100 + Math.random() * 900)}`,
        date,
        ratings,
        comments: newSub.description
      };
      setSurveyResponses(prev => [newSurveyRes, ...prev]);
      return id;
    }

    if (textInput.includes('staging') || textInput.includes('server') || textInput.includes('database') || textInput.includes('tech stack') || textInput.includes('migration') || textInput.includes('developer')) {
      aiCategory = 'Developer Experience & Infrastructure';
      priority = 'High';
      evidenceScore = 88;
      confidence = 92;
      evidenceBreakdown = [
        'Sentry tracking shows anomalous crash incidents in developers environments.',
        'Similar infrastructure remarks were detailed in 3 prior developer syncs.',
        'File uploaded or referenced for staging environment setup.'
      ];
      intelligenceSummary = 'The user identifies database schema synchronization delays. Development pipelines show recurring rebuild lags, supporting the report with high alignment.';
    } else if (textInput.includes('career') || textInput.includes('promotion') || textInput.includes('ladder') || textInput.includes('progression') || textInput.includes('growth')) {
      aiCategory = 'Career Development & Growth';
      priority = 'Medium';
      evidenceScore = 75;
      confidence = 89;
      evidenceBreakdown = [
        'HR dashboards reveal higher attrition rate for core Senior IC staff.',
        'External benchmarking indicates peer companies have standardized Dual Career Ladders.'
      ];
      intelligenceSummary = 'The user raises technical track growth bottlenecks. Internal logs and exit surveys align, indicating staff retention risks due to linear management conversion requirements.';
    } else if (textInput.includes('overtime') || textInput.includes('shift') || textInput.includes('warehouse') || textInput.includes('burnout') || textInput.includes('workload')) {
      aiCategory = 'Work Environment & Safety';
      priority = 'High';
      evidenceScore = 92;
      confidence = 95;
      evidenceBreakdown = [
        'Operations payroll shows a 30% increase in overtime hours this quarter.',
        'Work schedule logs confirm irregular shift extensions at fulfillment centers.'
      ];
      intelligenceSummary = 'The submission references severe overtime burnout. Shift planning analytics verify a workload imbalance relative to packaging volumes.';
    } else {
      aiCategory = 'Operational Efficiency';
      priority = 'Medium';
      evidenceScore = 70;
      confidence = 80;
      evidenceBreakdown = [
        'Standard operational feedback validation completed.',
        'System flags routine communication delays.'
      ];
      intelligenceSummary = 'The employee highlights administrative friction. Comm logs note delay variables, pointing to potential efficiency improvements.';
    }

    const assignedExecutive = newSub.department === 'Technology' ? 'CTO' : 'COO';

    const fullSubmission: Submission = {
      ...newSub,
      id,
      date,
      status: 'Pending Review',
      aiCategory,
      priority,
      evidenceScore,
      evidenceBreakdown,
      intelligenceSummary,
      confidence,
      assignedExecutive,
      actionPlan: null,
      verification: null
    };

    setSubmissions(prev => [fullSubmission, ...prev]);

    // Create notifications for the department head
    const newNotification: Notification = {
      id: `n-${Math.floor(1000 + Math.random() * 9000)}`,
      title: 'New Submission Routed',
      message: `A new ${newSub.type.toLowerCase()} regarding "${newSub.title.substring(0, 30)}..." has been routed to you.`,
      time: 'Just now',
      read: false,
      role: assignedExecutive
    };

    setNotifications(prev => [newNotification, ...prev]);

    return id;
  };

  // Department Head Assigns Action Plan
  const assignActionPlan = (
    submissionId: string,
    actionPlanData: Omit<ActionPlan, 'progress'>,
    managerId: string,
    priority: 'Low' | 'Medium' | 'High' | 'Critical',
    deadline: string,
    instructions: string
  ) => {
    setSubmissions(prev => prev.map(sub => {
      if (sub.id !== submissionId) return sub;

      const plan: ActionPlan = {
        ...actionPlanData,
        priority,
        deadline,
        instructions,
        progress: 0,
        checklist: actionPlanData.checklist.map(item => ({ ...item, completed: false }))
      };

      return {
        ...sub,
        status: 'In Progress',
        assignedManagerId: managerId,
        actionPlan: plan
      };
    }));

    const managerObj = INITIAL_MANAGERS.find(m => m.id === managerId);
    
    // Notifications
    const newNotifications: Notification[] = [
      {
        id: `n-${Math.floor(1000 + Math.random() * 9000)}`,
        title: 'New Action Assigned',
        message: `Action Plan "${actionPlanData.title}" has been assigned to you by ${currentUserRole}.`,
        time: 'Just now',
        read: false,
        role: 'Manager'
      },
      {
        id: `n-${Math.floor(1000 + Math.random() * 9000)}`,
        title: 'Action Scheduled',
        message: `Action plan initiated and assigned to ${managerObj?.name || 'Manager'}.`,
        time: 'Just now',
        read: false,
        role: 'Employee'
      }
    ];

    setNotifications(prev => [...newNotifications, ...prev]);
  };

  // Manager Updates Progress
  const updateManagerActionProgress = (
    submissionId: string,
    checklist: ChecklistItem[],
    progress: number,
    notes?: string,
    file?: { name: string; url: string }
  ) => {
    setSubmissions(prev => prev.map(sub => {
      if (sub.id !== submissionId || !sub.actionPlan) return sub;

      return {
        ...sub,
        actionPlan: {
          ...sub.actionPlan,
          checklist,
          progress,
          completionNotes: notes || sub.actionPlan.completionNotes,
          proofFileName: file ? file.name : sub.actionPlan.proofFileName,
          proofUrl: file ? file.url : sub.actionPlan.proofUrl
        }
      };
    }));
  };

  // Manager Marks Action Complete
  const completeManagerAction = (
    submissionId: string,
    notes: string,
    file?: { name: string; url: string }
  ) => {
    const today = new Date().toISOString().split('T')[0];
    
    setSubmissions(prev => prev.map(sub => {
      if (sub.id !== submissionId || !sub.actionPlan) return sub;

      const completedChecklist = sub.actionPlan.checklist.map(item => ({ ...item, completed: true }));

      return {
        ...sub,
        status: 'Resolved',
        actionPlan: {
          ...sub.actionPlan,
          checklist: completedChecklist,
          progress: 100,
          completedAt: today,
          completionNotes: notes,
          proofFileName: file ? file.name : sub.actionPlan.proofFileName,
          proofUrl: file ? file.url : sub.actionPlan.proofUrl
        }
      };
    }));

    // Find submission for employee notice
    const targetSub = submissions.find(s => s.id === submissionId);

    // Notifications
    const newNotifications: Notification[] = [
      {
        id: `n-${Math.floor(1000 + Math.random() * 9000)}`,
        title: 'Action Completed',
        message: `Manager completed action for "${targetSub?.title.substring(0, 20)}...". Please verify.`,
        time: 'Just now',
        read: false,
        role: 'Employee'
      },
      {
        id: `n-${Math.floor(1000 + Math.random() * 9000)}`,
        title: 'Resolution Submitted',
        message: `Action plan for "${targetSub?.title.substring(0, 20)}..." has been marked complete by the manager.`,
        time: 'Just now',
        read: false,
        role: targetSub?.assignedExecutive || 'CTO'
      }
    ];

    setNotifications(prev => [...newNotifications, ...prev]);
  };

  // Employee Verifies
  const submitEmployeeVerification = (
    submissionId: string,
    rating: 'Yes' | 'Partially' | 'No',
    score: number,
    comments: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    
    setSubmissions(prev => prev.map(sub => {
      if (sub.id !== submissionId) return sub;

      return {
        ...sub,
        status: 'Verified',
        verification: {
          improvementRating: rating,
          comments,
          score,
          date: today
        }
      };
    }));

    const targetSub = submissions.find(s => s.id === submissionId);

    // Notifications
    const newNotifications: Notification[] = [
      {
        id: `n-${Math.floor(1000 + Math.random() * 9000)}`,
        title: 'Resolution Verified',
        message: `Employee verified improvement as "${rating}" for "${targetSub?.title.substring(0, 20)}...".`,
        time: 'Just now',
        read: false,
        role: targetSub?.assignedExecutive || 'CTO'
      },
      {
        id: `n-${Math.floor(1000 + Math.random() * 9000)}`,
        title: 'Resolution Verified',
        message: `Employee verified improvement as "${rating}" for "${targetSub?.title.substring(0, 20)}...".`,
        time: 'Just now',
        read: false,
        role: 'CEO'
      }
    ];

    setNotifications(prev => [...newNotifications, ...prev]);
  };

  // Mark all notifications for a role read
  const markNotificationsAsRead = (role: UserRole) => {
    setNotifications(prev => prev.map(notif => {
      if (notif.role === role) {
        return { ...notif, read: true };
      }
      return notif;
    }));
  };

  return (
    <ResolveContext.Provider
      value={{
        currentUserRole,
        currentUserId,
        currentUserName,
        currentUserAvatar,
        currentUserDept,
        setCurrentUserRole,
        submissions,
        notifications,
        managers: INITIAL_MANAGERS,
        employees: INITIAL_EMPLOYEES,
        surveyResponses,
        addSubmission,
        assignActionPlan,
        updateManagerActionProgress,
        completeManagerAction,
        submitEmployeeVerification,
        markNotificationsAsRead
      }}
    >
      {children}
    </ResolveContext.Provider>
  );
};

export const useResolve = () => {
  const context = useContext(ResolveContext);
  if (!context) {
    throw new Error('useResolve must be used within a ResolveProvider');
  }
  return context;
};
