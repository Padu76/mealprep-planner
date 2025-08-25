// src/utils/supabaseOperations.ts
import { createClient } from '@supabase/supabase-js';
import { User, MealPlan, DatabaseResponse } from '../types';

// Inizializza Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🚨 SUPABASE ERROR: Missing environment variables');
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ===== USER OPERATIONS =====

/**
 * Crea o aggiorna un utente
 */
export async function createUser(userData: {
  nome: string;
  email: string;
  telefono?: string;
}): Promise<DatabaseResponse<User>> {
  try {
    console.log('👤 Creating/updating user:', userData.email);

    // Prima controlla se l'utente esiste già
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', userData.email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error fetching existing user:', fetchError);
      return { data: null, error: { message: fetchError.message, details: fetchError } };
    }

    if (existingUser) {
      // Aggiorna utente esistente
      console.log('🔄 Updating existing user:', existingUser.id);
      
      const { data, error } = await supabase
        .from('users')
        .update({
          nome: userData.nome,
          telefono: userData.telefono,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating user:', error);
        return { data: null, error: { message: error.message, details: error } };
      }

      console.log('✅ User updated successfully:', data.id);
      return { data, error: null };
    } else {
      // Crea nuovo utente
      console.log('➕ Creating new user:', userData.email);
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          nome: userData.nome,
          email: userData.email,
          telefono: userData.telefono,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating user:', error);
        return { data: null, error: { message: error.message, details: error } };
      }

      console.log('✅ User created successfully:', data.id);
      return { data, error: null };
    }

  } catch (err) {
    console.error('❌ Unexpected error in createUser:', err);
    return { 
      data: null, 
      error: { 
        message: err instanceof Error ? err.message : 'Unknown error',
        details: err 
      } 
    };
  }
}

/**
 * Recupera utente per email
 */
export async function getUserByEmail(email: string): Promise<DatabaseResponse<User>> {
  try {
    console.log('🔍 Fetching user by email:', email);

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.log('ℹ️ User not found:', email);
      return { data: null, error: { message: error.message, details: error } };
    }

    console.log('✅ User found:', data.id);
    return { data, error: null };

  } catch (err) {
    console.error('❌ Unexpected error in getUserByEmail:', err);
    return { 
      data: null, 
      error: { 
        message: err instanceof Error ? err.message : 'Unknown error',
        details: err 
      } 
    };
  }
}

// ===== MEAL PLAN OPERATIONS =====

/**
 * Salva un nuovo meal plan
 */
export async function saveMealPlan(mealPlanData: {
  nome_utente: string;
  email_utente: string;
  telefono_utente?: string;
  eta: number;
  sesso: string;
  peso: number;
  altezza: number;
  modalita: 'guidata' | 'esperto';
  attivita: string;
  obiettivo: string;
  durata: number;
  pasti: number;
  varieta: string;
  allergie: string[];
  preferenze: string[];
  bmr: number;
  tdee: number;
  calorie_target: number;
  distribuzione_pasti: Record<string, number>;
  piano_completo: string;
  piano_json?: any;
  generato_con_ai: boolean;
  fitness_optimized: boolean;
  total_recipes?: number;
  calorie_manuali?: number;
  proteine_manuali?: number;
  carboidrati_manuali?: number;
  grassi_manuali?: number;
  status: 'generato' | 'inviato' | 'completato';
}): Promise<DatabaseResponse<MealPlan>> {
  try {
    console.log('💾 Saving meal plan for:', mealPlanData.email_utente);

    // Prima ottieni o crea l'utente
    const userResult = await createUser({
      nome: mealPlanData.nome_utente,
      email: mealPlanData.email_utente,
      telefono: mealPlanData.telefono_utente
    });

    let userId: string;

    if (userResult.error || !userResult.data) {
      console.warn('⚠️ Could not create/get user, proceeding without user_id');
      userId = ''; // Procediamo comunque
    } else {
      userId = userResult.data.id;
      console.log('✅ User ID for meal plan:', userId);
    }

    const { data, error } = await supabase
      .from('meal_plans')
      .insert({
        user_id: userId,
        nome_utente: mealPlanData.nome_utente,
        email_utente: mealPlanData.email_utente,
        telefono_utente: mealPlanData.telefono_utente,
        eta: mealPlanData.eta,
        sesso: mealPlanData.sesso,
        peso: mealPlanData.peso,
        altezza: mealPlanData.altezza,
        modalita: mealPlanData.modalita,
        attivita: mealPlanData.attivita,
        obiettivo: mealPlanData.obiettivo,
        durata: mealPlanData.durata,
        pasti: mealPlanData.pasti,
        varieta: mealPlanData.varieta,
        allergie: mealPlanData.allergie,
        preferenze: mealPlanData.preferenze,
        bmr: mealPlanData.bmr,
        tdee: mealPlanData.tdee,
        calorie_target: mealPlanData.calorie_target,
        distribuzione_pasti: mealPlanData.distribuzione_pasti,
        piano_completo: mealPlanData.piano_completo,
        piano_json: mealPlanData.piano_json,
        generato_con_ai: mealPlanData.generato_con_ai,
        fitness_optimized: mealPlanData.fitness_optimized,
        total_recipes: mealPlanData.total_recipes,
        calorie_manuali: mealPlanData.calorie_manuali,
        proteine_manuali: mealPlanData.proteine_manuali,
        carboidrati_manuali: mealPlanData.carboidrati_manuali,
        grassi_manuali: mealPlanData.grassi_manuali,
        status: mealPlanData.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error saving meal plan:', error);
      return { data: null, error: { message: error.message, details: error } };
    }

    console.log('✅ Meal plan saved successfully:', data.id);
    return { data, error: null };

  } catch (err) {
    console.error('❌ Unexpected error in saveMealPlan:', err);
    return { 
      data: null, 
      error: { 
        message: err instanceof Error ? err.message : 'Unknown error',
        details: err 
      } 
    };
  }
}

/**
 * Recupera meal plans per utente (email)
 */
export async function getMealPlansByUser(email: string, limit: number = 10): Promise<DatabaseResponse<MealPlan[]>> {
  try {
    console.log('📋 Fetching meal plans for:', email);

    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('email_utente', email)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Error fetching meal plans:', error);
      return { data: null, error: { message: error.message, details: error } };
    }

    console.log('✅ Found meal plans:', data.length);
    return { data, error: null };

  } catch (err) {
    console.error('❌ Unexpected error in getMealPlansByUser:', err);
    return { 
      data: null, 
      error: { 
        message: err instanceof Error ? err.message : 'Unknown error',
        details: err 
      } 
    };
  }
}

/**
 * Recupera meal plan per ID
 */
export async function getMealPlanById(id: string): Promise<DatabaseResponse<MealPlan>> {
  try {
    console.log('🔍 Fetching meal plan by ID:', id);

    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error fetching meal plan by ID:', error);
      return { data: null, error: { message: error.message, details: error } };
    }

    console.log('✅ Meal plan found:', data.id);
    return { data, error: null };

  } catch (err) {
    console.error('❌ Unexpected error in getMealPlanById:', err);
    return { 
      data: null, 
      error: { 
        message: err instanceof Error ? err.message : 'Unknown error',
        details: err 
      } 
    };
  }
}

/**
 * Aggiorna status meal plan
 */
export async function updateMealPlanStatus(
  id: string, 
  status: 'generato' | 'inviato' | 'completato'
): Promise<DatabaseResponse<MealPlan>> {
  try {
    console.log('🔄 Updating meal plan status:', id, 'to', status);

    const { data, error } = await supabase
      .from('meal_plans')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating meal plan status:', error);
      return { data: null, error: { message: error.message, details: error } };
    }

    console.log('✅ Meal plan status updated:', data.id);
    return { data, error: null };

  } catch (err) {
    console.error('❌ Unexpected error in updateMealPlanStatus:', err);
    return { 
      data: null, 
      error: { 
        message: err instanceof Error ? err.message : 'Unknown error',
        details: err 
      } 
    };
  }
}

/**
 * Ottieni statistiche dashboard
 */
export async function getDashboardStats(): Promise<DatabaseResponse<{
  totalUsers: number;
  totalMealPlans: number;
  plansToday: number;
  plansThisWeek: number;
  plansThisMonth: number;
  plansByStatus: { status: string; count: number }[];
  plansByGoal: { obiettivo: string; count: number }[];
  averageCalories: number;
}>> {
  try {
    console.log('📊 Fetching dashboard statistics...');

    // Total users
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      console.error('❌ Error fetching users count:', usersError);
      return { data: null, error: { message: usersError.message, details: usersError } };
    }

    // Total meal plans
    const { count: totalMealPlans, error: plansError } = await supabase
      .from('meal_plans')
      .select('*', { count: 'exact', head: true });

    if (plansError) {
      console.error('❌ Error fetching meal plans count:', plansError);
      return { data: null, error: { message: plansError.message, details: plansError } };
    }

    // Plans today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: plansToday, error: todayError } = await supabase
      .from('meal_plans')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    // Plans this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count: plansThisWeek, error: weekError } = await supabase
      .from('meal_plans')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString());

    // Plans this month
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const { count: plansThisMonth, error: monthError } = await supabase
      .from('meal_plans')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthAgo.toISOString());

    // Plans by status
    const { data: statusData, error: statusError } = await supabase
      .from('meal_plans')
      .select('status')
      .order('status');

    const plansByStatus = statusData?.reduce((acc: any[], curr) => {
      const existing = acc.find(item => item.status === curr.status);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ status: curr.status, count: 1 });
      }
      return acc;
    }, []) || [];

    // Plans by goal
    const { data: goalData, error: goalError } = await supabase
      .from('meal_plans')
      .select('obiettivo')
      .order('obiettivo');

    const plansByGoal = goalData?.reduce((acc: any[], curr) => {
      const existing = acc.find(item => item.obiettivo === curr.obiettivo);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ obiettivo: curr.obiettivo, count: 1 });
      }
      return acc;
    }, []) || [];

    // Average calories
    const { data: caloriesData, error: caloriesError } = await supabase
      .from('meal_plans')
      .select('calorie_target');

    const averageCalories = caloriesData?.length 
      ? Math.round(caloriesData.reduce((sum, plan) => sum + (plan.calorie_target || 0), 0) / caloriesData.length)
      : 0;

    const stats = {
      totalUsers: totalUsers || 0,
      totalMealPlans: totalMealPlans || 0,
      plansToday: plansToday || 0,
      plansThisWeek: plansThisWeek || 0,
      plansThisMonth: plansThisMonth || 0,
      plansByStatus,
      plansByGoal,
      averageCalories
    };

    console.log('✅ Dashboard stats fetched:', stats);
    return { data: stats, error: null };

  } catch (err) {
    console.error('❌ Unexpected error in getDashboardStats:', err);
    return { 
      data: null, 
      error: { 
        message: err instanceof Error ? err.message : 'Unknown error',
        details: err 
      } 
    };
  }
}

// ===== UTILITY FUNCTIONS =====

/**
 * Test connessione database
 */
export async function testDatabaseConnection(): Promise<DatabaseResponse<boolean>> {
  try {
    console.log('🧪 Testing database connection...');

    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Database connection test failed:', error);
      return { data: false, error: { message: error.message, details: error } };
    }

    console.log('✅ Database connection successful');
    return { data: true, error: null };

  } catch (err) {
    console.error('❌ Unexpected error in database connection test:', err);
    return { 
      data: false, 
      error: { 
        message: err instanceof Error ? err.message : 'Unknown error',
        details: err 
      } 
    };
  }
}

/**
 * Pulisci database (SOLO PER DEVELOPMENT)
 */
export async function cleanupDatabase(): Promise<DatabaseResponse<boolean>> {
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️ Cleanup database is not allowed in production');
    return { 
      data: false, 
      error: { message: 'Operation not allowed in production' } 
    };
  }

  try {
    console.log('🧹 Cleaning up database...');

    // Delete meal plans first (foreign key constraint)
    const { error: plansError } = await supabase
      .from('meal_plans')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (plansError) {
      console.error('❌ Error deleting meal plans:', plansError);
      return { data: false, error: { message: plansError.message, details: plansError } };
    }

    // Then delete users
    const { error: usersError } = await supabase
      .from('users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (usersError) {
      console.error('❌ Error deleting users:', usersError);
      return { data: false, error: { message: usersError.message, details: usersError } };
    }

    console.log('✅ Database cleaned up successfully');
    return { data: true, error: null };

  } catch (err) {
    console.error('❌ Unexpected error in cleanupDatabase:', err);
    return { 
      data: false, 
      error: { 
        message: err instanceof Error ? err.message : 'Unknown error',
        details: err 
      } 
    };
  }
}