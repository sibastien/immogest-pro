import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore, dashboardPathByRole } from '../store/authStore';
import { useClientsStore } from '../store/clientsStore';
import { useAgentsStore } from '../store/agentsStore';
import { useCallsStore } from '../store/callsStore';
import { usePropertiesStore } from '../store/propertiesStore';

// Layouts
import { AdminLayout } from '../components/layout/AdminLayout';
import { CoordinatriceLayout } from '../components/layout/CoordinatriceLayout';
import { AgentBureauLayout } from '../components/layout/AgentBureauLayout';
import { AgentTerrainLayout } from '../components/layout/AgentTerrainLayout';
import { ClientLayout } from '../components/layout/ClientLayout';

// Auth
import { Login } from '../pages/auth/Login';

// Admin
import { AdminDashboard } from '../pages/admin/Dashboard';
import { AdminProperties } from '../pages/admin/Properties';
import { AdminClients } from '../pages/admin/Clients';
import { AdminTeam } from '../pages/admin/Team';
import { PropertyDetail } from '../pages/admin/PropertyDetail';
import { ClientDetail } from '../pages/admin/ClientDetail';
import { AdminPipeline } from '../pages/admin/Pipeline';
import { AdminTransactions } from '../pages/admin/Transactions';
import { AdminAgenda } from '../pages/admin/Agenda';
import { AdminDocuments } from '../pages/admin/Documents';
import { AdminRapports } from '../pages/admin/Rapports';
import { AdminAppels } from '../pages/admin/Appels';
import { AdminSettings } from '../pages/admin/Settings';

// Coordinatrice
import { CoordinatriceHub } from '../pages/coordinatrice/Hub';
import { CoordinatriceValidateCR } from '../pages/coordinatrice/ValidateCR';
import { CoordinatriceDispatch } from '../pages/coordinatrice/Dispatch';
import { CoordinatricePlanning } from '../pages/coordinatrice/Planning';
import { CoordinatriceCarteAgents } from '../pages/coordinatrice/CarteAgents';
import { CoordinatriceDossiers } from '../pages/coordinatrice/Dossiers';

// Agent Bureau
import { AgentBureauDashboard } from '../pages/agent-bureau/Dashboard';
import { AgentBureauAppels } from '../pages/agent-bureau/Appels';
import { AgentBureauProspects } from '../pages/agent-bureau/Prospects';
import { AgentBureauNouvelleFiche } from '../pages/agent-bureau/NouvelleFiche';
import { AgentBureauCatalogue } from '../pages/agent-bureau/Catalogue';

// Agent Terrain
import { AgentTerrainHome } from '../pages/agent-terrain/Home';
import { VisiteDetail } from '../pages/agent-terrain/VisiteDetail';
import { CompteRenduForm } from '../pages/agent-terrain/CompteRenduForm';
import { AgentTerrainPerformance } from '../pages/agent-terrain/Performance';
import { AgentTerrainClients } from '../pages/agent-terrain/MesClients';
import { AgentTerrainNouvelleFiche } from '../pages/agent-terrain/NouvelleFiche';
import { AgentTerrainAppels } from '../pages/agent-terrain/Appels';
import { AgentTerrainPlanifierVisite } from '../pages/agent-terrain/PlanifierVisite';

// Shared
import { NouveauBien } from '../pages/shared/NouveauBien';
import { MaJournee } from '../pages/shared/MaJournee';
import { PlanningAgents } from '../pages/shared/PlanningAgents';

// Client
import { ClientDashboard } from '../pages/client/Dashboard';
import { ClientDocuments } from '../pages/client/Documents';
import { ClientRendezVous } from '../pages/client/RendezVous';

// Loads the shared API data once the user is authenticated. Each loader is
// role-scoped server-side, so calling them all is safe for every role.
function useBootstrapData(isAuthenticated: boolean) {
  React.useEffect(() => {
    if (!isAuthenticated) return;
    useClientsStore.getState().load();
    useCallsStore.getState().load();
    usePropertiesStore.getState().load();
    const agents = useAgentsStore.getState();
    agents.loadAgents();
    agents.loadVisits();
    agents.loadComptesRendus();
    agents.loadTransactions();
  }, [isAuthenticated]);
}

// Route guard
const RequireAuth: React.FC<{ allowedRoles?: string[] }> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  useBootstrapData(isAuthenticated);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={dashboardPathByRole[user.role]} replace />;
  }

  return <Outlet />;
};

// Root redirect
const RootRedirect: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  return <Navigate to={dashboardPathByRole[user.role]} replace />;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <RootRedirect />,
  },

  // ADMIN
  {
    element: <RequireAuth allowedRoles={['admin']} />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'biens', element: <AdminProperties /> },
          { path: 'biens/:id', element: <PropertyDetail /> },
          { path: 'clients', element: <AdminClients /> },
          { path: 'clients/:id', element: <ClientDetail /> },
          { path: 'appels', element: <AdminAppels /> },
          { path: 'transactions', element: <AdminTransactions /> },
          { path: 'agenda', element: <AdminAgenda /> },
          { path: 'pipeline', element: <AdminPipeline /> },
          { path: 'equipe', element: <AdminTeam /> },
          { path: 'documents', element: <AdminDocuments /> },
          { path: 'rapports', element: <AdminRapports /> },
          { path: 'planning-agents', element: <PlanningAgents /> },
          { path: 'parametres', element: <AdminSettings /> },
        ],
      },
    ],
  },

  // COORDINATRICE
  {
    element: <RequireAuth allowedRoles={['coordinatrice']} />,
    children: [
      {
        path: '/coordinatrice',
        element: <CoordinatriceLayout />,
        children: [
          { index: true, element: <CoordinatriceHub /> },
          { path: 'dispatch', element: <CoordinatriceDispatch /> },
          { path: 'comptes-rendus', element: <CoordinatriceValidateCR /> },
          { path: 'carte', element: <CoordinatriceCarteAgents /> },
          { path: 'dossiers', element: <CoordinatriceDossiers /> },
          { path: 'planning', element: <CoordinatricePlanning /> },
          { path: 'nouveau-bien', element: <NouveauBien /> },
          { path: 'planning-agents', element: <PlanningAgents /> },
        ],
      },
    ],
  },

  // AGENT BUREAU
  {
    element: <RequireAuth allowedRoles={['agent_bureau']} />,
    children: [
      {
        path: '/agent-bureau',
        element: <AgentBureauLayout />,
        children: [
          { index: true, element: <AgentBureauDashboard /> },
          { path: 'appels', element: <AgentBureauAppels /> },
          { path: 'prospects', element: <AgentBureauProspects /> },
          { path: 'nouvelle-fiche', element: <AgentBureauNouvelleFiche /> },
          { path: 'catalogue', element: <AgentBureauCatalogue /> },
          { path: 'nouveau-bien', element: <NouveauBien /> },
          { path: 'ma-journee', element: <MaJournee /> },
          { path: 'agenda', element: <AdminAgenda /> },
        ],
      },
    ],
  },

  // AGENT TERRAIN
  {
    element: <RequireAuth allowedRoles={['agent_terrain']} />,
    children: [
      {
        path: '/agent-terrain',
        element: <AgentTerrainLayout />,
        children: [
          { index: true, element: <AgentTerrainHome /> },
          { path: 'visites', element: <AgentTerrainHome /> },
          { path: 'visites/:id', element: <VisiteDetail /> },
          { path: 'compte-rendu/:visitId', element: <CompteRenduForm /> },
          { path: 'planifier', element: <AgentTerrainPlanifierVisite /> },
          { path: 'appels', element: <AgentTerrainAppels /> },
          { path: 'clients', element: <AgentTerrainClients /> },
          { path: 'nouvelle-fiche', element: <AgentTerrainNouvelleFiche /> },
          { path: 'nouveau-bien', element: <NouveauBien /> },
          { path: 'ma-journee', element: <MaJournee /> },
          { path: 'performance', element: <AgentTerrainPerformance /> },
        ],
      },
    ],
  },

  // CLIENT
  {
    element: <RequireAuth allowedRoles={['client']} />,
    children: [
      {
        path: '/client',
        element: <ClientLayout />,
        children: [
          { index: true, element: <ClientDashboard /> },
          { path: 'documents', element: <ClientDocuments /> },
          { path: 'rendez-vous', element: <ClientRendezVous /> },
        ],
      },
    ],
  },

  // Fallback
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
