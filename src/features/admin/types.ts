export type DashboardPeriod = "today" | "week" | "month" | "year";

export type IncomeSlice = {
	label: string;
	value: number;
	color: string;
};

export type BalanceSummary = {
	total: number;
	income: number;
	expense: number;
	incomeDelta: string;
	expenseDelta: string;
};

export type DailyPoint = { label: string; value: number };

export type BestDish = {
	id: string;
	name: string;
	price: number;
	orders: number;
};

export type PeriodData = {
	income: IncomeSlice[];
	balance: BalanceSummary;
	daily: DailyPoint[];
	dishes: BestDish[];
};
