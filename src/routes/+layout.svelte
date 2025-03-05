<script lang="ts">
	import '../app.css';
	import NavBar from '@/lib/components/nav-bar.svelte';
	import { page } from '$app/stores';
	import { isProtectedRoute } from '$lib/utils';
  
	let { children, data } = $props();
  </script>
  
  {#if !isProtectedRoute($page.url.pathname)}
	<NavBar></NavBar>
  {/if}
  {@render children()}