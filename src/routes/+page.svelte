<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { ArrowRight, BarChart3, Wallet, Tags } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { getLoginUrl } from '$lib/utils';
</script>

<!-- Hero Section -->
<div class="relative isolate px-6 pt-14 lg:px-8">
	<div class="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
		<div class="text-center">
			<h1 class="text-4xl font-bold tracking-tight text-primary sm:text-6xl">
				Smart Portfolio Management for Everyone
			</h1>
			<p class="mt-6 text-lg leading-8 text-muted-foreground">
				Track, analyze, and optimize your investments across multiple asset classes. From stocks to crypto,
				manage your entire portfolio in one place with professional-grade tools made simple.
			</p>
			<div class="mt-10 flex items-center justify-center gap-x-6">
				<Button size="lg" onclick={() => goto(getLoginUrl())}>
					Get Started
					<ArrowRight class="ml-2 h-4 w-4" />
				</Button>
				<Button variant="outline" size="lg">Learn more</Button>
			</div>
		</div>
	</div>
</div>

<!-- Features Section -->
<div class="py-24 sm:py-32">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="mx-auto max-w-2xl lg:text-center">
			<h2 class="text-base font-semibold leading-7 text-primary">Portfolio Management</h2>
			<p class="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
				Everything you need to manage your investments
			</p>
			<p class="mt-6 text-lg leading-8 text-muted-foreground">
				From tracking your trades to analyzing your performance, our platform provides all the tools you
				need to make informed investment decisions.
			</p>
		</div>
		<div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
			<div class="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-3">
				<!-- Multi-Asset Support -->
				<Card class="hover:shadow-lg transition-shadow duration-300">
					<CardHeader>
						<Wallet class="h-8 w-8 text-primary mb-4" />
						<CardTitle>Multi-Asset Support</CardTitle>
						<CardDescription>
							Track investments across stocks, forex, and cryptocurrencies in one unified platform.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ul class="mt-2 text-sm text-muted-foreground">
							<li class="flex items-center gap-x-2">
								<div class="h-1.5 w-1.5 rounded-full bg-primary"></div>
								Real-time market data
							</li>
							<li class="flex items-center gap-x-2 mt-2">
								<div class="h-1.5 w-1.5 rounded-full bg-primary"></div>
								Automated price tracking
							</li>
							<li class="flex items-center gap-x-2 mt-2">
								<div class="h-1.5 w-1.5 rounded-full bg-primary"></div>
								Custom asset categories
							</li>
						</ul>
					</CardContent>
				</Card>

				<!-- Portfolio Analytics -->
				<Card class="hover:shadow-lg transition-shadow duration-300">
					<CardHeader>
						<BarChart3 class="h-8 w-8 text-primary mb-4" />
						<CardTitle>Advanced Analytics</CardTitle>
						<CardDescription>
							Gain deep insights into your portfolio's performance with professional-grade analytics.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ul class="mt-2 text-sm text-muted-foreground">
							<li class="flex items-center gap-x-2">
								<div class="h-1.5 w-1.5 rounded-full bg-primary"></div>
								Performance metrics
							</li>
							<li class="flex items-center gap-x-2 mt-2">
								<div class="h-1.5 w-1.5 rounded-full bg-primary"></div>
								Risk analysis
							</li>
							<li class="flex items-center gap-x-2 mt-2">
								<div class="h-1.5 w-1.5 rounded-full bg-primary"></div>
								Portfolio correlation
							</li>
						</ul>
					</CardContent>
				</Card>

				<!-- Portfolio Organization -->
				<Card class="hover:shadow-lg transition-shadow duration-300">
					<CardHeader>
						<Tags class="h-8 w-8 text-primary mb-4" />
						<CardTitle>Smart Organization</CardTitle>
						<CardDescription>
							Organize your investments with portfolios and tags for better management.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ul class="mt-2 text-sm text-muted-foreground">
							<li class="flex items-center gap-x-2">
								<div class="h-1.5 w-1.5 rounded-full bg-primary" > </div>
								Custom portfolios
							</li>
							<li class="flex items-center gap-x-2 mt-2">
								<div class="h-1.5 w-1.5 rounded-full bg-primary"></div>
								Flexible tagging system
							</li>
							<li class="flex items-center gap-x-2 mt-2">
								<div class="h-1.5 w-1.5 rounded-full bg-primary"></div>
								Smart filters
							</li>
						</ul>
					</CardContent>
				</Card>
			</div>
		</div>
	</div>
</div>
