jQuery(document).ready(function($){
	//open/close mega-navigation
	$('.cd-dropdown-trigger').on('click', function(event){
		event.preventDefault();
		toggleNav();
	});

	//close meganavigation
	$('.cd-dropdown .cd-close').on('click', function(event){
		event.preventDefault();
		toggleNav();
	});

	//on mobile - open submenu
	$('.has-children').children('a').on('click', function(event){
		//prevent default clicking on direct children of .has-children 
		event.preventDefault();
		var selected = $(this);
		selected.next('ul').removeClass('is-hidden').end().parent('.has-children').parent('ul').addClass('move-out');
	});

	//on desktop - differentiate between a user trying to hover over a dropdown item vs trying to navigate into a submenu's contents
	var submenuDirection = ( !$('.cd-dropdown-wrapper').hasClass('open-to-left') ) ? 'right' : 'left';
	$('.cd-dropdown-content').menuAim({
        activate: function(row) {
        	$(row).children().addClass('is-active').removeClass('fade-out');
        	if( $('.cd-dropdown-content .fade-in').length == 0 ) $(row).children('ul').addClass('fade-in');
        },
        deactivate: function(row) {
        	$(row).children().removeClass('is-active');
        	if( $('li.has-children:hover').length == 0 || $('li.has-children:hover').is($(row)) ) {
        		$('.cd-dropdown-content').find('.fade-in').removeClass('fade-in');
        		$(row).children('ul').addClass('fade-out')
        	}
        },
        exitMenu: function() {
        	$('.cd-dropdown-content').find('.is-active').removeClass('is-active');
        	return true;
        },
        submenuDirection: submenuDirection,
    });

	//submenu items - go back link
	$('.go-back').on('click', function(){
		var selected = $(this),
			visibleNav = $(this).parent('ul').parent('.has-children').parent('ul');
		selected.parent('ul').addClass('is-hidden').parent('.has-children').parent('ul').removeClass('move-out');
	}); 

	
	var selectedCategories=new Array;
	function checkCat()
		{
			selectedCategories=new Array;
			$("#category .choice.active").each(function(){
				selectedCategories.push($(this).find('h6').text());
				});
				console.log(selectedCategories);
				$("#selectedCategories").remove();

				if(selectedCategories.length)
					{
						$("#category h6.text-danger").text("");		
						
						$("#wizardProfile form").append("<input id='selectedCategories' type='hidden' name='selectedCategories' value='"+selectedCategories+"'/>");
						$("input[name='next']").attr('disabled',false);
					}
				else
					{
						$("#category h6.text-danger").text("Please select at least one category");		
						$("input[name='next']").attr('disabled',true);				
					}			
		}

	
	
	$("#category .choice").click(function(){
		$("input[name='next']").attr('disabled',true);	
		checkCat();
	});


	$(".btn-next").click(function(){
		
		if($("#category").hasClass('active'))
			{
				$(this).attr('disabled',true);				
				checkCat();
			}
		else
			{

			}
		
	});
	//jQuery("#businessNoOfLocations").parent().hide();

	jQuery("#phone,#alt_phone").keypress(function(e){
		var a = [];
                var k = e.which;

                for (i = 48; i < 58; i++)
                    a.push(i);

                if (!(a.indexOf(k)>=0))
                    e.preventDefault();
            });
	jQuery("#agreeTerms").change(function(){
		if(jQuery(this).is(":checked"))
			$("input[name='finish']").attr('disabled',false);
		else
			$("input[name='finish']").attr('disabled',true);
	})

	jQuery("#businessHaveMultipleLocation").change(function(){
		if(jQuery(this).val()=='Yes') 
			jQuery('#businessNoOfLocations').parent().show(); 
		else 
			jQuery('#businessNoOfLocations').val(0).parent().hide();
	});

	

	function toggleNav(){
		var navIsVisible = ( !$('.cd-dropdown').hasClass('dropdown-is-active') ) ? true : false;
		$('.cd-dropdown').toggleClass('dropdown-is-active', navIsVisible);
		$('.cd-dropdown-trigger').toggleClass('dropdown-is-active', navIsVisible);
		if( !navIsVisible ) {
			$('.cd-dropdown').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',function(){
				$('.has-children ul').addClass('is-hidden');
				$('.move-out').removeClass('move-out');
				$('.is-active').removeClass('is-active');
			});	
		}
	}	

});

