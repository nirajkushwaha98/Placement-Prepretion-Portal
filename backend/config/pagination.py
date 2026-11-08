from rest_framework.pagination import PageNumberPagination


class DefaultPagination(PageNumberPagination):
    """Default for all list endpoints.

    The frontend reads only the first page, so a page size of 20 hid most tests and
    questions once the question bank grew. Use a large default and honour ?page_size=.
    """
    page_size = 200
    page_size_query_param = 'page_size'
    max_page_size = 1000
