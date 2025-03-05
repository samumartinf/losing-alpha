<script lang="ts">
	import { isAuthenticated, logout } from '$lib/stores/auth';
	import { Button } from '$lib/components/ui/button';
	import { getApplicationUrl, getLoginUrl } from '$lib/utils';
	
	let isAuth = false;
	isAuthenticated.subscribe(value => {
		isAuth = value;
	});
	
	function handleLogout() {
		logout();
	}
</script>

<nav class="bg-white shadow-sm border-b">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between h-16">
			<div class="flex">
				<div class="flex-shrink-0 flex items-center">
					<a href="/" class="text-xl font-bold text-primary">FleeceFund</a>
				</div>
				<div class="hidden sm:ml-6 sm:flex sm:space-x-8">
					<a href="/" class="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
						Home
					</a>
					{#if isAuth}
						<a href={getApplicationUrl()}  class="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
							Dashboard
						</a>
					{/if}
				</div>
			</div>
			<div class="hidden sm:ml-6 sm:flex sm:items-center">
				{#if isAuth}
					<Button variant="outline" onclick={handleLogout}>Sign Out</Button>
				{:else}
					<Button href={getLoginUrl()}>Sign In</Button>
				{/if}
			</div>
		</div>
	</div>
</nav> 