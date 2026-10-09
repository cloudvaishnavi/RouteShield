from flask import jsonify
def success_response(data=None, message='Success', status_code=200):
    response = {'success': True}
    if message: response['message'] = message
    if data is not None:
        if isinstance(data, dict): response.update(data)
        else: response['data'] = data
    return jsonify(response), status_code

def error_response(code, message, details=None, status_code=400):
    error_dict = {'code': code, 'message': message}
    if details: error_dict['details'] = details
    return jsonify({'success': False, 'error': error_dict}), status_code
